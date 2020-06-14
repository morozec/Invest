import React, { useState, useEffect } from 'react';

export function YahooFinance(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
     
      const response = await fetch('api/yahoofinance/prices?symbols=a,b,c', {method:'GET'});
      if (response.ok) {
        console.log('test ok');
      } else {
        console.log('test not ok')
      }

      setIsLoading(false);
    })();
  }, [])



  let content;
  if (isLoading) {
    content = <p><em>Loading...</em></p>;
  } else {
    content = data
  }


  return (
    <div>
      {content}
    </div>
  )
}

