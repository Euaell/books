import mongoose from "mongoose"
import configs from "./configs/config"
import app from "./app"

mongoose.connect(configs.MONGO_URI)
.then(() => {
    console.log("MongoDB connected")
    app.listen(configs.PORT, () => {
        console.log(`Server started on port ${configs.PORT}`)
    })
}).catch(err => {
    console.log(err)
})