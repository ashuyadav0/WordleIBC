'use strict'

import {dic} from "./dictionary.js";

const NUMBER_OF_GUESSES = 6;

// Guardamos los datos del usuario
let userParameters = {
    firstName: null,
    lastName: null,
    email: null,
    telephone: null,
}

let userParametersValidator = {
    firstName: /^([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+)(\s+([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+))*$/,
    lastName: /^([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+)(\s+([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+))*$/,
    email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    telephone: /^(([0-9]{2})?[ ]?[6789][0-9 ]{8})$/
}

// Datos de partida
let gameParameters = {
    word: newWord(),
    guessesRemaining: NUMBER_OF_GUESSES,
    currentGuess: [],
    nextLetter: 0,
    numberOfGames: 1,
    numberOfWin: 0,
    speed: 0,
    bestGame: 0,
    bestSpeed: Number.MAX_VALUE
}

window.onload = () => {

    // Datos del Html que nos ayudaran mas a futuro
    const handleGameOptions = {
        myForm: document.getElementById('myForm'),
        btn_ok: document.getElementById('btn_ok'),
        help_outline: document.getElementById('info'),
        newGame: document.getElementById('renew'),
        barChart: document.getElementById('bar_chart'),
        del: document.getElementById('del'),
        entr: document.getElementById('entr'),
        gameboard: document.getElementsByTagName('div')[12],
    }

    if (handleGameOptions.myForm) {
        handleGameOptions.myForm.style.display = "block";
    }

    // Validamos el formulario para obtener los correctos datos del usuario
    handleGameOptions.btn_ok.addEventListener("click", validateForm, false);

    /**
     * Obtenemos los datos agregados al formulario y validamos su correcto funcionamiento
     */
    function validateForm() {
        userParameters.firstName = document.getElementById('nom').value;
        userParameters.lastName = document.getElementById('cognom').value;
        userParameters.email = document.getElementById('email').value;
        userParameters.telephone = document.getElementById('telnum').value;

        if (
            userParametersValidator.firstName.test(userParameters.firstName) &&
            userParametersValidator.lastName.test(userParameters.lastName) &&
            userParametersValidator.email.test(userParameters.email) &&
            userParametersValidator.telephone.test(userParameters.telephone)
        ) {
            handleGameOptions.myForm.style.display = "none";
            document.getElementById('container').style.display = "block";

            // Si el formulario es correcto activaremos los botones

            // - Si pulsamos en el boton de informacion nos mostrara un popup con informacion de la partida
            handleGameOptions.help_outline.addEventListener('click', info, false);

            // - Si pulsamos en el boton de estadisticas nos mostrara un popup con estadisticas de la partida
            handleGameOptions.barChart.addEventListener('click', estadisticas, false);

            // - Si pulsamos en el boton de reniew empezaremos una partida nueva
            handleGameOptions.newGame.addEventListener('click', renewGame, false);

            startGame()
        } else {
            
            // Sabiendo que los datos no son validos comprobaremos si es un campo vacio o es un campo no valido.
            
            // - Si el valor esta vacio mostraremos el siguiente mensaje y si no comprobaremos que el mensaje
            //   este correctamente escrito
            if  (
                userParameters.firstName.length === 0 ||
                userParameters.lastName.length === 0 ||
                userParameters.email.length === 0 ||
                userParameters.telephone.length === 0
            ) {

                let errorValidator = {
                    firstName: userParameters.firstName.length === 0,
                    lastName: userParameters.lastName.length === 0,
                    email: userParameters.email.length === 0,
                    telephone: userParameters.telephone.length === 0
                }

                let invalidFields = Object.entries(errorValidator)
                    .filter(([field, isValid]) => isValid)
                    .map(([field]) => field);

                // Traducimos los errores a catalan
                let str = ''
                for (let i = 0; i < invalidFields.length; i++) {
                    switch (invalidFields[i]) {
                        case 'firstName':
                            str += ', nom'
                            break;
                        case 'lastName':
                            str += ', cognom'
                            break;
                        case 'email':
                            str += ', email'
                            break;
                        case 'telephone':
                            str += ', telèfon'
                            break;
                    }
                }
                // Borraremos el primer caracter osea la ","
                str = str.slice(1);

                // Mostramos error
                Swal.fire({
                    icon: 'warning',
                    text: 'Si us plau, no deixis el camp del' + str + ' en blanc',
                })
            } else {
                // Guardaremos los que son incorrectos para devolver un mensjaje de error personalizado
                let errorValidator = {
                    firstName: userParametersValidator.firstName.test(userParameters.firstName),
                    lastName: userParametersValidator.lastName.test(userParameters.lastName),
                    email: userParametersValidator.email.test(userParameters.email),
                    telephone: userParametersValidator.telephone.test(userParameters.telephone)
                }

                let invalidFields = Object.entries(errorValidator)
                    .filter(([field, isValid]) => !isValid)
                    .map(([field]) => field);

                // Traducimos los errores a catalan
                let str = ''
                for (let i = 0; i < invalidFields.length; i++) {
                    switch (invalidFields[i]) {
                        case 'firstName':
                            str += ', nom'
                            break;
                        case 'lastName':
                            str += ', cognom'
                            break;
                        case 'email':
                            str += ', email'
                            break;
                        case 'telephone':
                            str += ', telèfon'
                            break;
                    }
                }
                // Borraremos el primer caracter osea la ","
                str = str.slice(1);

                // Mostramos error
                Swal.fire({
                    icon: 'warning',
                    text: 'El foramt del' + str + ' no és correcte',
                })
            }
        }
    }

    /**
     * Crearemos la funcionalidad de las teclas y del juego
     */
    function startGame() {
        board()
        keyboard()
        startTimer()
    }

    /**
     * Cargamos tablero nuevo
     */
    function board() {
        document.getElementById('game-board').innerHTML = ''
        let content = ''
        for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
            content += '<div class="letter-row">';

            for (let j = 0; j < 5; j++) {
                content += '<div class="letter-box"></div>';
            }
            content += '</div>'
        }
        document.getElementById('game-board').innerHTML = content
    }

    function keyboard() {

        /* Esdeveniment del teclat fisic*/
        document.addEventListener("keyup", (event) => {

            if (gameParameters.guessesRemaining === 0) {
                return
            }

            if (event.key === "Backspace" && gameParameters.nextLetter !== 0) {
                deleteLetter()
                return
            }

            if (event.key === "Enter") {
                checkGuess()
                return
            }

            let found = event.key.match(/[a-z+ç]/g)
            if (!found || found.length > 1) {
                return
            } else {
                insertLetter(event.key)
            }
        })

        /* Esdeveniment del teclat virtual*/
        document.getElementById("keyboard-cont").addEventListener("click", (event) => {

            if (event.target === del) {
                deleteLetter()
                return
            } else if (event.target === entr) {
                checkGuess()
                return
            }

            document.dispatchEvent(new KeyboardEvent("keyup", {'key': event.target.textContent}))
        })
    }


    /**
     *  Funció que comprava la paraula
     **/
    function checkGuess() {
        let row = document.getElementsByClassName("letter-row")[6 - gameParameters.guessesRemaining]
        let guessString = ''
        let rightGuess = Array.from(gameParameters.word)

        for (const value of gameParameters.currentGuess) {
            guessString += value
        }

        if (guessString.length !== 5) {
            Swal.fire({
                icon: 'error',
                title: 'Has de completar la paraula',
                text: "No pots deixar cel·les en blanc, Acaba de completar la parula, si us plau. Si t'has equivocat pots esborar amb la tecla de retroccés.",
            })
            return false;
        }

        if (!dic.includes(guessString)) {
            Swal.fire({
                icon: 'error',
                title: 'Aquesta paraula no existeix al diccionari',
            })
            return false;
        }


        for (let i = 0; i < 5; i++) {
            let letterColor = ''
            let box = row.children[i]

            let letterPosition = rightGuess.indexOf(gameParameters.currentGuess[i])
            if (letterPosition === -1) {
                letterColor = 'grey'
            } else {
                letterColor = (gameParameters.currentGuess[i] === rightGuess[i]) ? 'green' : 'yellow'
                rightGuess[letterPosition] = "#"
            }


            setTimeout(() => {
                box.style.backgroundColor = letterColor
            }, 250 * i)
        }

        if (guessString === gameParameters.word) {
            gameParameters.numberOfWin++;
            Swal.fire({
                icon: 'success',
                title: 'Enhorabona! Has guanyat!',
                text: 'Ho has aconseguit amb ' + (gameParameters.guessesRemaining - 1) + ' intents i amb ' + gameParameters.speed + ' segons',
            })
            stopTimer()
            gameParameters.bestGame = (gameParameters.guessesRemaining - 1 > gameParameters.bestGame) ? gameParameters.guessesRemaining - 1 : gameParameters.bestGame;
            gameParameters.bestSpeed = (gameParameters.speed > gameParameters.bestSpeed) ? gameParameters.bestSpeed : gameParameters.speed;
            gameParameters.guessesRemaining = 0;
            return false;
        } else {
            gameParameters.guessesRemaining -= 1;
            gameParameters.currentGuess = [];
            gameParameters.nextLetter = 0;

            if (gameParameters.guessesRemaining === 0) {
                Swal.fire({
                    icon: 'error',
                    title: "Has perdut el numero d'intents!",
                    text: 'La paraula certa era: ' + gameParameters.word.charAt(0).toUpperCase() + gameParameters.word.slice(1),
                })
                stopTimer()
            }
        }
    }

    /**
     * Funció per inserta lletra
     * */
    function insertLetter(pressedKey) {
        if (gameParameters.nextLetter === 5) {
            return
        }
        pressedKey = pressedKey.toLowerCase()

        let row = document.getElementsByClassName("letter-row")[6 - gameParameters.guessesRemaining]
        let box = row.children[gameParameters.nextLetter]
        box.textContent = pressedKey
        box.classList.add("filled-box")
        gameParameters.currentGuess.push(pressedKey)
        gameParameters.nextLetter += 1
    }

    /**
     *  Funció per elimina lletra
     *  */
    function deleteLetter() {
        let row = document.getElementsByClassName("letter-row")[6 - gameParameters.guessesRemaining]
        let box = row.children[gameParameters.nextLetter - 1]
        box.textContent = ""
        box.classList.remove("filled-box")
        gameParameters.currentGuess.pop()
        gameParameters.nextLetter -= 1
    }

    /**
     * Resetea la partida para poder volver a jugar
     */
    function renewGame() {
        gameParameters.word = newWord()
        gameParameters.guessesRemaining = NUMBER_OF_GUESSES
        gameParameters.currentGuess = []
        gameParameters.nextLetter = 0
        gameParameters.numberOfGames++
        gameParameters.speed = 0

        handleGameOptions.newGame.removeEventListener("click", startGame, false);
        handleGameOptions.newGame.addEventListener("click", startGame, false);
        board()
        startTimer()
    }

    // Agregaremos un cronometro para obtener la partida mas rapida realizada
    let timer;

    function startTimer() {
        let startTime = new Date();
        timer = setInterval(function () {
            let elapsedTime = new Date() - startTime;
            gameParameters.speed = parseFloat((elapsedTime / 1000).toFixed(2))
        }, 20);

    }

    function stopTimer() {
        clearInterval(timer);
    }

}

/**
 * Mostraremos informacion para saber como jugar.
 */
function info() {
    Swal.fire({
        icon: 'info',
        title: 'Com jugar al WordleIBC?',
        html:
            '<p>Endevina el <b>Wordle</b> en 6 intents.</p>' +
            "<p>Has d'introduir paraules de 5 lletres que existeixin i fer clic a ENTER.</p>" +
            "<p>Després de cada intent, el color de les lletres canviarà per indicar l'evolució de la partida.</p>" +
            "<p>No es tenen en compte els accents a l'ahora d'introduir paraules.</p>" +
            "<p>Es poden repetir lletres.</p>" +
            "<p>Exemples:</p>" +
            "<div id='wordle'>" +
            "<div class='w3-green'>P</div>" +
            "<div>I</div>" +
            "<div>L</div>" +
            "<div>O</div>" +
            "<div>T</div></div>" +
            "La lletra <b>P</b> es troba en el lloc corretce de la partida<br><br>" +
            "<div id='wordle'>" +
            "<div>D</div>" +
            "<div>O</div>" +
            "<div class='w3-amber'>T</div>" +
            "<div>Z</div>" +
            "<div>E</div></div>" +
            "La paraula té la lletra <b>T</b> però en un altre lloc<br><br>" +
            "<div id='wordle'>" +
            "<div>M</div>" +
            "<div>A</div>" +
            "<div>G</div>" +
            "<div>I</div>" +
            "<div class='w3-grey'>C</div></div>" +
            "La paraula no conté la lletra <b>C</b>",
    })
}

/**
 * Mostraremos un popup con las estadisticas del juego.
 */
function estadisticas() {
    Swal.fire({
        imageUrl: 'https://w7.pngwing.com/pngs/283/859/png-transparent-bar-chart-computer-icons-diagram-%E6%88%BF%E5%9C%B0%E4%BA%A7-angle-text-rectangle.png',
        title: 'Estadístiques',
        html: '<p>Nom del jugador: ' + userParameters.firstName + ' ' + userParameters.lastName + '</p>' +
            '<p>Partidas realizades: ' + gameParameters.numberOfGames + '</p>' +
            '<p>Partidas guanyades: ' + gameParameters.numberOfWin + '</p>' +
            '<p>Millor partida: ' + gameParameters.bestGame + '</p>' +
            '<p>Partida més ràpida: ' + ((gameParameters.bestSpeed !== Number.MAX_VALUE) ? gameParameters.bestSpeed : 0) + '</p>',
        imageWidth: 100,
        imageAlt: 'Custom image',
    })

}

/**
 * Devolveremos una palabra aleatoria del dicionario.
 * @return {string}
 */
function newWord() {
    let word = dic[Math.floor(Math.random() * dic.length)]
    console.log(word)
    return word
}