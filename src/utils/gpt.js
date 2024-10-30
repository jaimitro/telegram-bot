const inteligencia = require("openai");

async function crearHistoria(temas) {
    const cliente = new inteligencia.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const respuesta = await cliente.chat.completions.create(
        {
            model: "chatgpt-4o-latest",
            messages:
                [
                    { role: "system", content: "Eres un bot de telegram que cuenta historias." },
                    { role: "assistant", content: "Debes responder con la historia siendo muy maleducado." },
                    {
                        role: "user", content: `Crea unicamente una historia basándote en estos temas: ${temas}.
                         La historia debe estar limitada a dos párrafos. Tiene que tener una molareja final.
                          Tiene que contener muchos insultos.` }
                ]
        }
    );
    console.log(respuesta.choices[0]);
    const historia = respuesta.choices[0].message.content;

    const imagen = await cliente.images.generate(
        {
            model: "dall-e-3",
            prompt: `Crea una imagen sin texto que sea adecuada para esta historia: ${historia}.`,
            n: 1,
            size: "1024x1024"
        }
    );
    console.log("______imagen:_________", imagen);
    const urlImagen = imagen.data[0].url;

    return [historia, urlImagen];
}

const respuestaNormal = async (frase) => {
    const cliente = new inteligencia.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const respuesta = await cliente.chat.completions.create(
        {
            model: "chatgpt-4o-latest",
            messages:
                [
                    //personalidad del bot
                    { role: "system", content: "Eres una abuelita. Estás bajo los efectos del alcohol. El demonio te ha poseído." },
                    //como va a responder, incluso tecnicamente
                    { role: "assistant", content: "Debes responder con muchas palabras y ser muy infantil y malheducada." },
                    { role: "user", content: frase }
                ]
        }
    );

    console.log(respuesta.choices[0]);
    return respuesta.choices[0].message.content;
}

module.exports = {
    crearHistoria,
    respuestaNormal
}