const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');
const fs = require('fs');
const app = express();

// Middleware para analizar cuerpos de solicitudes JSON
app.use(bodyParser.urlencoded({ extended: true }));

// Archivo CSS para estilos
app.use(express.static('public'));

// Ruta raíz que devuelve el formulario HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Ruta para procesar la imagen
app.post('/black_and_white', async (req, res) => {
    try {
        // Obtenemos la URL de la imagen del formulario
        const imageUrl = req.body.image_url;

        // Procesamos la imagen
        const image = await Jimp.read(imageUrl);
        image
            .grayscale() // Convertir a escala de grises
            .resize(350, Jimp.AUTO); // Redimensionar a 350px de ancho, mantener proporción

        // Generamos un nombre único para la imagen
        const imageName = uuidv4() + '.jpg';

        // Guardamos la imagen alterada en el servidor
        await image.writeAsync('public/images/' + imageName);

        // Devolvemos la URL de la imagen procesada
        res.send('<img src="/images/' + imageName + '" alt="Processed Image">');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error procesando la imagen');
    }
});



app.post('/delete_image', async (req, res) => {
    try {
        const imageUrl = req.body.image_url;

        // Extraemos el nombre de archivo de la URL de la imagen
        const fileName = imageUrl.split('/').pop();

        // Ruta completa de la imagen en el servidor
        const imagePath = __dirname + '/public/images/' + fileName;

        // Verificamos si el archivo existe antes de intentar eliminarlo
        if (fs.existsSync(imagePath)) {
            // Eliminamos la imagen del servidor
            fs.unlinkSync(imagePath);
            console.log('Imagen eliminada:', fileName);
            res.redirect('/');
        } else {
            console.log('La imagen no existe:', fileName);
            res.status(404).send('La imagen no existe');
        }
    } catch (error) {
        console.error('Error eliminando la imagen:', error);
        res.status(500).send('Error eliminando la imagen');
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});