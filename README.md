# Get URL Info :-> Node.js API :-> Cheerio

This is a Node.js API with one POST endpoint that takes a URL as input and returns a JSON object with the following information:
    - Title: /api/get-url-info
        - Params: 
            1- url: [string] (required)
        - Response: [1 of the following]
            - 200 OK: [array of file URLs] 
            - 400 Bad Request: [error message]
            - 500 Internal Server Error: [error message]

TODO -
    - Add endpoint to decide what to do with info
        + Save to file
        + Datastore MongoDB, Postgres, etc.

### Get file url info:
```javascript```

```Cheerio``` 
    is a web scraping library that makes it easy to scrape information from web pages. It is built on top of the popular ```requests``` and ```BeautifulSoup``` 
        libraries, and provides a simple interface for making HTTP requests and parsing the resulting HTML.
