import express from 'express';
import { Story } from '../models/Story.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload, cloudinary } from '../config/upload.js';

const router = express.Router();

// Default cover endpoint
router.get('/default-cover', (req, res) => {
  const defaultCoverUrl = process.env.DEFAULT_COVER_URL || 'https://via.placeholder.com/400x600/cccccc/ffffff?text=No+Cover';
  res.redirect(defaultCoverUrl);
});

// Create story
router.post('/', authenticateToken, upload.single('cover'), async (req, res) => {
  try {
    console.log('📝 Received new story request');
    
    const { title, description, category, language } = req.body;
    const coverImage = req.file ? req.file.path : process.env.DEFAULT_COVER_URL;

    if (!title || !description || !Array.isArray(JSON.parse(category)) || JSON.parse(category).length === 0 || !language) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required and category must be an array' 
      });
    }

    const authorId = req.user.id;

    const newStory = new Story({
      title,
      description,
      category: JSON.parse(category),
      language,
      author: authorId,
      cover: coverImage,
      chapters: [],
      published: false,
      publishedAt: null,
      lastPublishedAt: null,
      publishedChapters: [],
      views: 0
    });

    await newStory.save();
    console.log('✅ Story saved successfully:', newStory._id);

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story: newStory
    });

  } catch (error) {
    console.error('❌ Error creating story:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create story', 
      error: error.message 
    });
  }
});

// Get all published stories
router.get('/published', async (req, res) => {
  try {
    const stories = await Story.find({ 
      published: true,
      'chapters.published': true 
    })
    .populate('author', 'username')
    .select('title description category language author publishedAt chapters cover')
    .sort('-lastPublishedAt');

    const processedStories = stories.map(story => ({
      ...story.toObject(),
      chapters: story.chapters.filter(ch => ch.published)
    }));

    console.log('📚 Sending stories with covers:', processedStories.map(s => ({ 
      title: s.title, 
      cover: s.cover 
    })));

    res.json({
      success: true,
      stories: processedStories
    });

  } catch (error) {
    console.error('Error fetching published stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch published stories',
      error: error.message
    });
  }
});

// Get all stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'username firstName lastName')
      .select('-chapters.content');
    
    res.json({
      success: true,
      stories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch stories', 
      error: error.message 
    });
  }
});

// Get single story (public access for published stories, auth for unpublished)
router.get('/:id', async (req, res) => {
  try {
    console.log(`📖 Fetching story ${req.params.id}`);
    
    const story = await Story.findById(req.params.id)
      .populate('author', 'username firstName lastName')
      .populate('collaborators.user', 'username firstName lastName');

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: 'Story not found' 
      });
    }

    // If story has published chapters, allow public access
    const hasPublishedChapters = story.chapters.some(ch => ch.published);
    
    if (hasPublishedChapters) {
      // Return only published chapters for public access
      const publicStory = {
        ...story.toObject(),
        chapters: story.chapters.filter(ch => ch.published)
      };
      
      return res.json({
        success: true,
        story: publicStory
      });
    }

    // If no published chapters, require authentication
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({ 
        success: false,
        message: 'This story has no published content' 
      });
    }

    // Verify token and check access for unpublished content
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if user has access (owner or collaborator)
      const isOwner = story.author && story.author._id.toString() === req.user.id;
      const isCollaborator = story.collaborators && story.collaborators.some(
        collab => collab.user && collab.user._id.toString() === req.user.id
      );

      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied' 
        });
      }

      // Return full story for authorized users
      res.json({
        success: true,
        story
      });

    } catch (jwtError) {
      return res.status(403).json({ 
        success: false,
        message: 'This story has no published content' 
      });
    }

  } catch (error) {
    console.error('❌ Error fetching story:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch story',
      error: error.message 
    });
  }
});

// Update story
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the story and verify ownership/collaboration
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user has edit access (owner or collaborator)
    const isOwner = story.author.toString() === req.user.id;
    const isCollaborator = story.collaborators && story.collaborators.some(
      collab => collab.user && collab.user.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this story'
      });
    }

    // Update the story directly with all provided fields
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName');

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found after update'
      });
    }
    
    res.json({ 
      success: true,
      message: 'Story updated successfully',
      story: updatedStory
    });

  } catch (error) {
    console.error('❌ Error updating story:', error);
    res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// Update story cover
router.put('/:id/cover', authenticateToken, upload.single('cover'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this story'
      });
    }

    // Delete old cover image from Cloudinary if it exists and isn't the default
    if (story.cover && story.cover.includes('cloudinary.com') && !story.cover.includes('default-cover')) {
      try {
        const urlParts = story.cover.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `storypad-covers/${publicIdWithExtension.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Deleted old cover image:', publicId);
      } catch (deleteError) {
        console.log('Could not delete old image:', deleteError.message);
      }
    }

    const coverUrl = req.file.path; // Cloudinary URL
    console.log('📸 New cover URL from Cloudinary:', coverUrl);

    // Update the story with the new cover
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { cover: coverUrl },
      { new: true }
    ).populate('author', 'username firstName lastName');

    console.log('✅ Story cover updated in database:', updatedStory.cover);

    res.json({
      success: true,
      message: 'Cover image updated successfully',
      coverUrl: updatedStory.cover
    });

  } catch (error) {
    console.error('❌ Error updating cover image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cover image',
      error: error.message
    });
  }
});

// Publish chapters
router.put('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { publishedChapters } = req.body;

    // Find story and verify ownership
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the author can publish chapters' 
      });
    }

    // Update chapters publish status
    story.chapters = story.chapters.map((chapter, idx) => ({
      ...chapter,
      published: publishedChapters.includes(idx),
      publishedAt: publishedChapters.includes(idx) ? new Date() : chapter.publishedAt
    }));

    // Update story publish status
    story.published = story.chapters.some(ch => ch.published);
    if (story.published && !story.publishedAt) {
      story.publishedAt = new Date();
    }
    story.lastPublishedAt = new Date();
    story.publishedChapters = publishedChapters;

    await story.save();

    res.json({
      success: true,
      message: 'Chapters published successfully',
      story
    });

  } catch (error) {
    console.error('Error publishing chapters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish chapters',
      error: error.message
    });
  }
});

// Get comments for a chapter (last 3 or all)
router.get('/:storyId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { storyId, chapterId } = req.params;
    const { all } = req.query;
    const story = await Story.findById(storyId); // Removed populate
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    const chapter = story.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    let comments = chapter.comments || [];
    if (!all) comments = comments.slice(-3); // last 3 by default
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments', error: err.message });
  }
});

// Add a comment to a chapter
router.post('/:storyId/chapters/:chapterId/comments', authenticateToken, async (req, res) => {
  try {
    const { storyId, chapterId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment text required' });
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    const chapter = story.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const user = req.user;
    chapter.comments.push({ user: user.id, username: user.username, text });
    await story.save();
    res.status(201).json({ success: true, comment: chapter.comments[chapter.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add comment', error: err.message });
  }
});

// Like a story
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    const userId = req.user.id;
    if (story.likes.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }
    story.likes.push(userId);
    await story.save();
    res.json({ success: true, likes: story.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to like story', error: err.message });
  }
});

// Unlike a story
router.post('/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    const userId = req.user.id;
    const idx = story.likes.indexOf(userId);
    if (idx === -1) {
      return res.status(400).json({ success: false, message: 'Not liked yet' });
    }
    story.likes.splice(idx, 1);
    await story.save();
    res.json({ success: true, likes: story.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to unlike story', error: err.message });
  }
});

export default router;