import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Building, Phone, MapPin, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePhone, getGoogleMapsLinkFeedback, extractCoordinatesFromLink } from '../utils/helpers';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    stationName: '',
    phone: '',
    googleMapsLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [linkFeedback, setLinkFeedback] = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  // Real-time validation for Google Maps link
  useEffect(() => {
    if (formData.googleMapsLink) {
      const feedback = getGoogleMapsLinkFeedback(formData.googleMapsLink);
      setLinkFeedback(feedback);
    } else {
      setLinkFeedback(null);
    }
  }, [formData.googleMapsLink]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stationName.trim()) {
      newErrors.stationName = 'Station name is required';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g., 0771234567)';
    }

    // Use the improved validation
    const mapsFeedback = getGoogleMapsLinkFeedback(formData.googleMapsLink);
    if (!mapsFeedback.isValid) {
      newErrors.googleMapsLink = mapsFeedback.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // IMPORTANT FIX: Extract coordinates and send them with the form data
    const coordinates = extractCoordinatesFromLink(formData.googleMapsLink);
    
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      setErrors({
        googleMapsLink: 'Could not extract coordinates from the link. Please try a different format.'
      });
      return;
    }

    // Create submission data with coordinates
    const submissionData = {
      ...formData,
      lat: coordinates.lat,
      lng: coordinates.lng
    };

    console.log('Submitting with coordinates:', submissionData);

    setLoading(true);
    try {
      const success = await register(submissionData);
      if (success) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exampleLinks = [
    'https://maps.app.goo.gl/TqJ2RSVYXYoeHSN9',
    'https://www.google.com/maps/place/Fire+Station+Ganemulla/@7.0675882,79.9597962,17z',
  ];

  const getFeedbackIcon = () => {
    if (!linkFeedback) return null;
    switch (linkFeedback.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getFeedbackColor = () => {
    if (!linkFeedback) return 'border-gray-300';
    switch (linkFeedback.type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RapidAid</h1>
          <p className="text-gray-600">Register Your Fire Station</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Link
              to="/login"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Station Registration</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Station Name */}
            <div>
              <label htmlFor="stationName" className="block text-sm font-medium text-gray-700 mb-2">
                Station Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="stationName"
                  name="stationName"
                  type="text"
                  value={formData.stationName}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.stationName ? 'border-danger-500' : ''}`}
                  placeholder="Ganemulla fire station"
                  required
                />
              </div>
              {errors.stationName && (
                <p className="mt-1 text-sm text-danger-600">{errors.stationName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.phone ? 'border-danger-500' : ''}`}
                  placeholder="0714289356"
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>
              )}
            </div>

            {/* Google Maps Link with Real-time Validation */}
            <div>
              <label htmlFor="googleMapsLink" className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps Location Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="googleMapsLink"
                  name="googleMapsLink"
                  type="url"
                  value={formData.googleMapsLink}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${getFeedbackColor()} ${errors.googleMapsLink ? 'border-danger-500' : ''}`}
                  placeholder="https://maps.app.goo.gl/xxxxx"
                  required
                />
                {linkFeedback && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {getFeedbackIcon()}
                  </div>
                )}
              </div>

              {/* Real-time Feedback */}
              {linkFeedback && (
                <div className={`mt-2 p-3 rounded-lg text-sm ${
                  linkFeedback.type === 'success' ? 'bg-green-50 text-green-800' :
                  linkFeedback.type === 'error' ? 'bg-red-50 text-red-800' :
                  linkFeedback.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {getFeedbackIcon()}
                    <span>{linkFeedback.message}</span>
                  </div>
                  {linkFeedback.coordinates && (
                    <div className="mt-2 text-xs font-mono bg-white/50 px-2 py-1 rounded">
                      Coordinates: {linkFeedback.coordinates.lat}, {linkFeedback.coordinates.lng}
                    </div>
                  )}
                </div>
              )}

              {errors.googleMapsLink && (
                <p className="mt-1 text-sm text-danger-600">{errors.googleMapsLink}</p>
              )}

              {/* Help Section */}
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-2">How to get your Google Maps link:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Open Google Maps and search for your fire station</li>
                      <li>Click on your station when it appears</li>
                      <li>Click the <strong>"Share"</strong> button</li>
                      <li>Copy the link shown and paste it here</li>
                    </ol>
                    
                    <button
                      type="button"
                      onClick={() => setShowExamples(!showExamples)}
                      className="mt-3 text-blue-600 hover:text-blue-800 font-medium underline text-sm"
                    >
                      {showExamples ? 'Hide' : 'Show'} example links
                    </button>

                    {showExamples && (
                      <div className="mt-3 space-y-2">
                        <p className="font-medium text-blue-900">Valid link examples:</p>
                        {exampleLinks.map((link, index) => (
                          <div
                            key={index}
                            className="bg-white rounded px-3 py-2 text-xs font-mono break-all cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => setFormData(prev => ({ ...prev, googleMapsLink: link }))}
                            title="Click to use this example"
                          >
                            {link}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || (linkFeedback && !linkFeedback.isValid)}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                'Register Station'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> After registration, use your phone number to login and start receiving emergency alerts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;