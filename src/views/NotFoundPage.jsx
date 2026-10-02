import { Link } from 'react-router';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <main className="notfound">
      <p className="notfound-code">
        <span aria-hidden="true">// </span>404
      </p>
      <h1>Page not found</h1>
      <p className="notfound-text">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="notfound-button">
        Back to home
      </Link>
    </main>
  );
}

export default NotFoundPage;