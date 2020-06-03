import React, { useState, useEffect } from 'react';

export function YahooFinance(props) {
  const { userData } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const init = userData === null
        ? null
        : {
          method: 'GET',
          headers: {
            "Accept": "application/json",
            'Authorization': 'Bearer ' + userData.token
          }
        }
      console.log(init)
      const response = await fetch('api/yahoofinance/login', init);
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

