import { readFileSync } from "fs";
import { createServer } from "http";

const html = `
    <html>
        <head>
            <title> App </title>
            <style> body { margin: 0 } </style>
        </head>
        <body>
            <div id="root"></div>
            <script>
                ${ readFileSync("./out/client.js").toString() }
            </script>
        </body>
    </html>
`;

const server = createServer((request, response) => {
    response.writeHead(200, {
        "Content-Type": "text/html",
    });

    response.end(html);
});

server.listen(1317, (error: any) => {
    if (error) {
        console.error(error);
    }

    const address = server.address();
    console.info(`App running at ${address.address}:${address.port}`);
});
