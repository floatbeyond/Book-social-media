import { Link } from 'react-router-dom';

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-storypad-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold text-storypad-primary">Story<span className="text-storypad-accent">Pad</span></span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-storypad-dark">Create your account</h2>
          <p className="mt-2 text-sm text-storypad-text-light">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-storypad-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-storypad-dark">
                  First name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="input w-full mt-1"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-storypad-dark">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="input w-full mt-1"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-storypad-dark">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input w-full mt-1"
                placeholder="Choose a unique username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-storypad-dark">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input w-full mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-storypad-dark">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input w-full mt-1"
                placeholder="Create a password"
              />
              <p className="mt-1 text-xs text-storypad-text-light">
                Must be at least 8 characters and include a number and a special character.
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-storypad-dark">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="input w-full mt-1"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 border-gray-300 rounded text-storypad-primary focus:ring-storypad-primary"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-storypad-text">
              I agree to the{' '}
              <Link to="/terms" className="text-storypad-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-storypad-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              Create account
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-storypad-text-light">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-storypad-dark hover:bg-gray-50"
            >
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Facebook</span>
              </div>
            </button>

            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-storypad-dark hover:bg-gray-50"
            >
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                <span>Google</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
