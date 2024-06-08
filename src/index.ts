import 'dotenv/config'
import io from './io.server';
import HTTPServer from './http.server';

const PORT = process.env.PORT || 3000

io // needed for the io server to be instiated

HTTPServer.listen(3000, () => {
  console.log('Server running on port', PORT)
})
