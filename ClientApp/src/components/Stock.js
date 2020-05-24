import React, { useState, useEffect } from 'react';

export function YahooFinance() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const response = await fetch('api/yahoofinance/info/msft');
      const test = await response.json();
      console.log(test);
      setIsLoading(false);
    })();
  }, [])



  let content;
  if (isLoading) {
    content = <p><em>Loading...</em></p>;
  } else {
    content = <p><em>Loaded</em></p>
  }
    

  return (
    <div>
      <h1>Balance sheet</h1>
      {content}
    </div>
  )
}

