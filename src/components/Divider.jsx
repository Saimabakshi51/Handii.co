export default function Divider({ text }) {
  return (
    <div className="doodle-divider">
      <div className="line" />
      <span>{text}</span>
      <div className="line" />
    </div>
  );
}
