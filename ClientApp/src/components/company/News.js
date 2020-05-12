import React, { useState, useEffect } from 'react';
import { Media } from 'react-bootstrap';
import {getDateStringFromUnixTime} from '../../helpers'

export function News(props) {
    const [news, setNews] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isActive } = props;


    useEffect(() => {
        if (!isActive) return;
        if (news) return;

        const ibmSymbol = 'ibm';
        // const ibmId = 69543;
        setIsLoading(true);

        const getNews = async (companySymbol) => {
            const response = await fetch(`api/finnhub/news/${companySymbol}`);
            const news = await response.json();
            return news;
        }


        getNews(ibmSymbol).then(result => {
            setNews(result);
            setIsLoading(false);
            console.log(result)
        })

    }, [isActive, news])


    let content;

    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        content =
            <ul>
                {news.map((newsItem) =>
                    <Media key={newsItem.id} as='li'>
                        <a href={newsItem.url} target='_blank' rel="noopener noreferrer">
                            <img className='newsImage'
                                src={newsItem.image}
                                alt={newsItem.headline}
                            />
                        </a>
                        <Media.Body>
                            <h5><a href={newsItem.url} target='_blank' rel="noopener noreferrer">{newsItem.headline}</a></h5>
                            <h6>By {newsItem.source} - {getDateStringFromUnixTime(newsItem.datetime)}</h6>
                            <p>{newsItem.summary}</p>
                        </Media.Body>
                    </Media>
                )}
            </ul>
    }

    return (
        <div>
            <div className='statementHeader'>
                <h1>IBM News</h1>
            </div>
            {content}
        </div>
    )
}

