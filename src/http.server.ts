import { createServer } from "http";
import app from "./express.server";

const HTTPServer = createServer(app)

export default HTTPServer