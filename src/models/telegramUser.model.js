const mongoose = require("mongoose");

const telegramUserSchema = new mongoose.Schema({
    telegram_id: String,
    is_bot: Boolean,
    first_name: String,
    last_name: String,
    language_code: String
}, {
    timestamps: true, versionKey: false
});

const User = mongoose.model("user", telegramUserSchema);//nombre en singular, esquema creado
module.exports = User;