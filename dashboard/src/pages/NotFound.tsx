import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-inner">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-sub">
          The route you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/app/overview" className="btn btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
