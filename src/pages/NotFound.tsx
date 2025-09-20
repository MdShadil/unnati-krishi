import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-earth">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">पेज नहीं मिला</h2>
          <p className="text-muted-foreground mb-8">
            क्षमा करें, यह पेज उपलब्ध नहीं है या हटा दिया गया है।
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-block bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-medium transition-all duration-300"
          >
            होम पेज पर जाएं
          </Link>
          <p className="text-sm text-muted-foreground">
            या आप <Link to="/login" className="text-primary hover:underline">लॉगिन</Link> कर सकते हैं
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
