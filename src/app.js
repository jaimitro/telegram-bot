// Creation and configuration of the Express APP
const express = require('express');
const cors = require('cors');
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const User = require("./models/telegramUser.model");//importo el model del mongoose

//configurar bot
require("dotenv").config();
const gestorTelegraf = require("telegraf");

const { crearHistoria, respuestaNormal } = require('./utils/gpt');

const bot = new gestorTelegraf.Telegraf(process.env.BOT_TOKEN);
app.use(bot.webhookCallback("/telegram_bot"));//cuando le llegan peticiones a expresss lo manda a telegram
bot.telegram.setWebhook(`${process.env.BOT_URL}/telegram_bot`);//URL a la que me tiene que devolver cosas el bot de telegram

//MIDDLEWARE antes que se gestionen los comandos
bot.use(async (ctx, next) => {//cada comando escrito en telegran pasará primero por aqui
    console.log("______________>>______________", ctx.message, "______________<<______________");
    const idUsuario = ctx.message.from.id;
    //mirar si esta en la base de datos
    const userEncontrado = await User.findOne({ telegram_id: idUsuario });
    if (!userEncontrado) {//si no esta lo inserto
        console.log("antes: ", ctx.message.from);
        ctx.message.from.telegram_id = ctx.message.from.id;
        delete ctx.message.from.id;
        console.log("despues ", ctx.message.from);
        await User.create(ctx.message.from);
    }
    next();
});

//comandos del bot //ctx es el contexto es como el res, req
bot.command("tiempo", async (ctx) => {

    const ciudad = ctx.message.text.substring(8);
    try {
        const tiempo = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=' + ciudad + '&appid=12cc61f3282afaca14152a6185f43de0&units=metric');
        respuesta = "Hola Chuski, estos son los datos del lugar que me pides.Temperatura: <b>" + tiempo.data.main.temp + "</b>";
        respuesta += " Presión: <b>" + tiempo.data.main.pressure + "</b>";
        respuesta += " Humedad: <b>" + tiempo.data.main.humidity + "</b> ❤❤😊😘 TEQUIEROOOO!";
        await ctx.replyWithHTML(respuesta);
        //
        await ctx.replyWithLocation(tiempo.data.coord.lat, tiempo.data.coord.lon);

    } catch (error) {
        ctx.reply("Encontrado un error: ", error.response.data.message);
    }

});

bot.command("historia", async (ctx) => {//comando con OPENAI
    //const temas = ctx.message.text.substring(9);// esta otra opcion extra todo desde la letra novena
    const temas = ctx.message.text.replace('/historia', '');//este otro remplace historia por ""
    console.log(ctx.message.text.replace('/historia', ''));
    const [historia, urlImagen] = (await crearHistoria(temas));
    ctx.reply(historia);
    ctx.replyWithPhoto(urlImagen);
});

bot.on("message", async (ctx) => {
    const frase = ctx.message.text;
    const respuesta = await respuestaNormal(frase);
    console.log(frase, respuesta);
    ctx.reply(respuesta);
});

bot.on('location', ctx => {
    ctx.reply("Recibida");
});

bot.on('photo', ctx => {
    ctx.reply(`Mensaje:  ${ctx.message.text}`);
});

// Route configuration
app.post('/telegram_bot', (req, res) => { //punto de entrada a la aplicacion bot
    res.send("funciona");
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json(err);
})

module.exports = app;