const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();


const authRoutes = require("./routes/auth");
const loadRoutes = require("./routes/load");         
const cargoRoutes = require("./routes/cargo");
const ratingRoutes = require("./routes/rating");
const messageRoutes = require("./routes/message");
const adminRoutes = require("./routes/admin");

app.use(cors());
app.use(express.json());


app.use("/api", loadRoutes);
app.use("/api", authRoutes);                 
app.use("/api", cargoRoutes);                
app.use("/api", ratingRoutes);               
app.use("/api", messageRoutes);              
app.use("/api/admin", adminRoutes);          


// Start the server
const PORT = process.env.PORT || 7210;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

