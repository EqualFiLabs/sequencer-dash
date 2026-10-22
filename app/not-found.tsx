import Link from "next/link";
export default function NotFound() {
  return (
    <div className="not-found">
      <div className="eyebrow">404 / OUTSIDE THE SIGNAL</div>
      <h1>This page is off the map.</h1>
      <p>Return to the observatory or explore the documentation.</p>
      <Link className="button primary" href="/">
        Back to overview
      </Link>
    </div>
  );
}
