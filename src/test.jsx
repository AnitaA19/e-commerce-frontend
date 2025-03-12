import React from 'react';

function App() {
  const product = { name: 'Product Name' };  
  const json = 'some-json-string';          

  const toKebabCase = (str) => {
    return str
      .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  return (
    <div>
      <p>{toKebabCase(product.name || json)}</p>
    </div>
  );
}

export default App;
