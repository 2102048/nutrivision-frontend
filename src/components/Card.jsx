function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
}

export default Card;
