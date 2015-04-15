
/* Created by Raymond Huynh on 4/11/15. */

var mouseInterval = null;
var gameInterval = null;
var blocksize = 24;
var isPlaying = false;
var snakeFood;

(function() {

    displayHighScores();

    var snake = document.querySelector('div.game-area');

    // Register EL (event listener) on high score
    document.querySelector('p#hscores').addEventListener('click', function() {

        updateLoadingPage('section.main', 'section.high-scores');

        displayHighScores();
    });

    // Register EL on new game
    document.querySelector('p#new-game').addEventListener('click', function() {
        updateLoadingPage('section.high-scores', 'section.main')
    });

    document.querySelector('div#level').addEventListener('click', function(event) {

        updateLoadingPage('section.main', 'section.game-content');

        gameSet(parseInt(event.target.className));
    });

    window.addEventListener('keydown', function(event) {
       // top = 38, right = 39, left = 37, down = 40
        if ( isPlaying ) {
            switch ( event.keyCode ) {
                case 37:
                    moveLeft(snake);
                    break;
                case 38:
                    moveUp(snake);
                    break;
                case 39:
                    moveRight(snake);
                    break;
                case 40:
                    moveDown(snake);
                    break;
                default :
                    break;
            }
        }
    });

    document.querySelector('div#slug').addEventListener('mouseenter', function(e) { onMouseEnter(e); });
    document.querySelector('div#worm').addEventListener('mouseenter', function(e) { onMouseEnter(e); });
    document.querySelector('div#python').addEventListener('mouseenter', function(e) { onMouseEnter(e); });

    document.querySelector('div#slug').addEventListener('mouseleave', function(e) { onMouseLeave(e); });
    document.querySelector('div#worm').addEventListener('mouseleave', function(e) { onMouseLeave(e); });
    document.querySelector('div#python').addEventListener('mouseleave', function(e) { onMouseLeave(e); });

}());

function gameSet( level ) {

    console.log("calling gameSet()");

    var countDown = document.querySelector('div.game-area');
    var counter = 0;


    gameInterval = window.setInterval( function() {

        if ( counter >= 5 ) {
            countDown.innerHTML = "";

            clearInterval(gameInterval);

            gameStart(level);
        }

        else {
            countDown.innerHTML = ( ++counter <= 3 ) ? counter.toString(10) : 'GO!';
        }

    }, 500);
}

function onMouseLeave(event) {
    /*
    console.log(event.target.id + " = " + event.target.offsetTop, event.target.offsetLeft,
        event.target.offsetHeight, event.target.offsetWidth);  */

    clearInterval(mouseInterval);

    var snakeBlocks = event.target.childNodes[1];

    while ( snakeBlocks.firstChild ) { snakeBlocks.removeChild(snakeBlocks.firstChild); }
}

function onMouseEnter(event) {

    var target = event.target;
    var snakeBlocks = target.childNodes[1];

    // Set boundary for snake to roam
    var left = target.offsetLeft + ( target.offsetWidth / 4 );
    var bottom = target.offsetTop + ( target.offsetHeight / 2);

    createSnake(snakeBlocks, bottom, left);

    var counter = 0;

    var level = parseInt(snakeBlocks.className);

    mouseInterval = setInterval( function() {
        switch (counter) {
            case 0:
            case 1:
            case 2:
                moveUp(snakeBlocks);
                break;

            case 3:
            case 4:
            case 5:
                moveRight(snakeBlocks);
                break;

            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                moveDown(snakeBlocks);
                break;

            case 11:
            case 12:
            case 13:
                if ( snakeBlocks.firstChild ) { snakeBlocks.removeChild(snakeBlocks.firstChild); };
                break;

            case 14:
                createSnake(snakeBlocks, bottom, left);
                counter = 0;
                break;

            default :
                counter = 0;
                break;
        }

        counter++;

    }, (900 / level) );
}

function createSnake( parent, top, left ) {
    // remove all blocks
    while ( parent.hasChildNodes() ) { parent.removeChild(parent.firstChild); }

    for ( var i = 0; i < 3; i++ ) {
        var div = createElement( 'div', parent );
        div.className = 'block';
        div.style.top = top - (i * blocksize) + 'px';
        div.style.left = left + 'px';
    }
}

function gameStart( level ) {
    var divGameArea = document.querySelector('div.game-area');
    var rect = divGameArea.parentNode.getBoundingClientRect();
    var median = rect.width / 2;

    for ( var i = 0; i < 3; i++ ) {
        var div = createElement('div', divGameArea);
        div.className = 'block';
        div.style.left = median + 'px';
        div.style.top = blocksize + (i * blocksize) + 'px';
    }

    isPlaying = true;

    generateFood();

    gameInterval = setInterval( function() {

        var snakeRect = divGameArea.lastChild.getBoundingClientRect();
        var snakeHead = divGameArea.lastChild;

        if ( snakeRect.bottom >= rect.bottom || snakeRect.left <= rect.left ||
            snakeRect.right >= rect.right || snakeRect.top <= rect.top ) {

            clearInterval(gameInterval);

            isPlaying = false;

            for ( var i = 0, len = divGameArea.childNodes.length; i < len; i++ ) {
                divGameArea.childNodes[i].classList.add('game-over');
            }
        }
        else {
            //console.log("top: " + snakeHead.offsetTop + " <==> left: " + snakeHead.offsetLeft);
            if ( Math.abs(snakeHead.offsetTop - snakeFood.offsetTop) <= blocksize  &&
                Math.abs(snakeHead.offsetLeft - snakeFood.offsetLeft) <= blocksize ) {

                snakeGrow(divGameArea);
                generateFood();
            }

            moveDown(divGameArea);
        }

    }, (900 / level) );
}

function snakeGrow(snake) {
    var div = document.createElement('div');
    div.className = 'block';

    div.style.top = snake.lastChild.offsetTop + blocksize + 'px';
    div.style.left = snake.lastChild.style.left;

    snake.appendChild(div);
}

function generateFood() {
    var section = document.querySelector('section.game-content');

    if (!snakeFood) {
        snakeFood = createElement('div', section);
        snakeFood.className = 'game-food';
    }

    snakeFood.style.left = ( Math.floor( Math.random() * (section.offsetWidth - blocksize) )) + 'px';
    snakeFood.style.top = ( Math.floor( Math.random() * (section.offsetHeight - blocksize) )) + 'px';

}

function moveUp(parent) {
    // remove last element and update it
    if ( parent.hasChildNodes() ) {
        var node = parent.removeChild(parent.firstChild);
        node.style.top = parent.lastChild.offsetTop - blocksize + 'px';
        node.style.left = parent.lastChild.style.left;
        parent.appendChild(node);
    }
}

function moveDown(parent) {
    if ( parent.hasChildNodes() ) {
        var node = parent.removeChild(parent.firstChild);
        node.style.top = parent.lastChild.offsetTop + blocksize + 'px';
        node.style.left = parent.lastChild.style.left;
        parent.appendChild(node);
    }
}

function moveRight(parent) {
    if ( parent.hasChildNodes() ) {
        var node = parent.removeChild(parent.firstChild);
        node.style.left = parent.lastChild.offsetLeft + blocksize + 'px';
        node.style.top = parent.lastChild.style.top;
        parent.appendChild(node);
    }
}

function moveLeft(parent) {
    if ( parent.hasChildNodes() ) {
        var node = parent.removeChild(parent.firstChild);
        node.style.top = parent.lastChild.style.top;
        node.style.left = parent.lastChild.offsetLeft - blocksize + 'px';
        parent.appendChild(node);
    }
}

function updateLoadingPage(section1, section2) {

    document.querySelector(section1).style.display = 'none';

    document.querySelector(section2).style.display = 'inline-block';
}

function displayHighScores() {
    var section = document.querySelector('section.high-scores');

    // if not already create elements
    if ( !section.hasChildNodes() ) {

        // create a p element
        var p_loading = document.createElement('p');
        var text = document.createTextNode('LOADING...');
        p_loading.appendChild(text);
        section.appendChild(p_loading);

        // create a table
        var table = document.createElement("table");
        table.setAttribute("id", "scores");

        var thead = document.createElement('thead');
        table.appendChild(thead);

        var tr = document.createElement('tr');
        thead.appendChild(tr);

        var slug = document.createElement('th');
        text = document.createTextNode('SLUG');
        slug.appendChild(text);
        tr.appendChild(slug);

        var worm = document.createElement('th');
        text = document.createTextNode('WORM');
        worm.appendChild(text);
        tr.appendChild(worm);

        var python = document.createElement('th');
        text = document.createTextNode('PYTHON');
        python.appendChild(text);
        tr.appendChild(python);

        // table data
        for (var i = 1; i <= 10; i++) {
            // create row - tr element
            var tr = document.createElement('tr');

            // create td element
            var slug = document.createElement('td');
            var text = document.createTextNode(i + '. ...');
            slug.appendChild(text);
            tr.appendChild(slug);

            var worm = document.createElement('td');
            text = document.createTextNode('...');
            worm.appendChild(text);
            tr.appendChild(worm);

            var python = document.createElement('td');
            text = document.createTextNode('...');
            python.appendChild(text);
            tr.appendChild(python);

            table.appendChild(tr);
        }

        section.appendChild(table);

        var newgame = document.createElement('p');
        newgame.setAttribute('id', 'new-game');
        text = document.createTextNode('> NEW GAME <');
        newgame.appendChild(text);
        section.appendChild(newgame);
    }
}

function createElement(elementType, parent, innerHtml, custom) {
    var element = document.createElement(elementType);

    if ( parent ) { parent.appendChild(element); }

    if ( innerHtml ) { element.innerHTML = innerHtml; }

    if ( typeof custom !== 'undefined' ) {
        for ( var prop in custom ) {
            element.setAttribute( prop, custom[prop] );
        }
    }

    return element;
}
