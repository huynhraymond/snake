
/* Created by Raymond Huynh on 4/13/15. */

/************************* Global function *************************/
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

/************************* Snake Object ****************************/
function Snake() {
    this.intervalID = null;
    this.blockSize = 24;
    this.snakeBody = document.querySelector('div.game-area');
    this.direction = 0; /* 0 = not playing, 1 = move down, 2 = move up, 3 = move left, 4 = move right */
    this.page = new Page();
}

Snake.prototype.init = function() {
    var counter = 0;

    var saveThis = this;

    var id = setInterval( function() {

        if (counter >= 5) {
            saveThis.snakeBody.innerHTML = '';
            clearInterval(id);

            saveThis.loadGame();
        }

        else {
            saveThis.snakeBody.innerHTML = ( ++counter <= 3 ) ? counter.toString(10) : 'GO!';
        }

    }, 500);
};

Snake.prototype.loadGame = function() {

    var median = ( this.snakeBody.offsetWidth - this.snakeBody.offsetLeft ) / 2;
    var containerRect = this.snakeBody.getBoundingClientRect();

    for ( var i = 0; i < 3; i++ ) {
        this.addSnakeBlock(this.snakeBody, this.blockSize + (i * this.blockSize), median );
    }

    this.direction = 1;

    var saveThis = this;
    saveThis.generateSnakeFood();

    saveThis.intervalID = setInterval( function() {

        var snakeHead = saveThis.snakeBody.lastChild;

        if ( snakeHead.offsetTop >= containerRect.bottom || snakeHead.offsetLeft <= containerRect.left ||
                snakeHead.offsetLeft >= containerRect.right || snakeHead.offsetTop <= containerRect.top ||
                !saveThis.direction) {

            clearInterval(saveThis.intervalID);

            saveThis.direction = 0;

            for ( var i = 0, len = saveThis.snakeBody.childNodes.length; i < len; i++ ) {
                saveThis.snakeBody.childNodes[i].classList.add('game-over');
            }
        }

        else {
            if ( Math.abs(snakeHead.offsetTop - saveThis.snakeFood.offsetTop) <= saveThis.blockSize &&
                Math.abs(snakeHead.offsetLeft - saveThis.snakeFood.offsetLeft) <= saveThis.blockSize ) {

                saveThis.addSnakeBlock(saveThis.snakeBody);
                saveThis.generateSnakeFood();

            }

            /* 0 = not playing, 1 = move down, 2 = move up, 3 = move left, 4 = move right */
            switch( saveThis.direction ) {
                case 1:
                    saveThis.moveDown(saveThis.snakeBody);
                    break;
                case 2:
                    saveThis.moveUp(saveThis.snakeBody);
                    break;
                case 3:
                    saveThis.moveLeft(saveThis.snakeBody);
                    break;
                case 4:
                    saveThis.moveRight(saveThis.snakeBody);
                    break;
                default:
                    saveThis.direction = 0;
                    break;
            }
        }

    }, 600);
};

Snake.prototype.generateSnakeFood = function() {
    var section = document.querySelector('section.game-content');

    if ( !this.snakeFood ) {
        this.snakeFood = Page.prototype.createElement.call(this, 'div', section);
        this.snakeFood.className = 'game-food';
    }

    var left = ( Math.floor( Math.random() * (section.offsetWidth - this.blockSize) ));
    var top =  ( Math.floor( Math.random() * (section.offsetHeight - this.blockSize) ));

    this.snakeFood.style.left = left + 'px';
    this.snakeFood.style.top = top + 'px';

};

Snake.prototype.addSnakeBlock = function(parent, top, left) {

    var snakeTop = top || parent.lastChild.offsetTop + this.blockSize;
    var snakeLeft = left || parent.lastChild.offsetLeft;

    var div = Page.prototype.createElement.call(this, 'div', parent);
    div.classList.add('block');

    div.style.top = snakeTop + 'px';
    div.style.left = snakeLeft + 'px';
};

Snake.prototype.moveUp = function(snake) {
    if ( snake.hasChildNodes() ) {
        var node = snake.removeChild(snake.firstChild);
        node.style.top = snake.lastChild.offsetTop - this.blockSize + 'px';
        node.style.left = snake.lastChild.style.left;
        snake.appendChild(node);
    }
};

Snake.prototype.moveDown = function(snake) {
    if (snake.hasChildNodes()) {
        var node = snake.removeChild(snake.firstChild);
        node.style.top = snake.lastChild.offsetTop + this.blockSize + 'px';
        node.style.left = snake.lastChild.style.left;
        snake.appendChild(node);
    }
};

Snake.prototype.moveLeft = function(snake) {
    if (snake.hasChildNodes()) {
        var node = snake.removeChild(snake.firstChild);
        node.style.top = snake.lastChild.style.top;
        node.style.left = snake.lastChild.offsetLeft - this.blockSize + 'px';
        snake.appendChild(node);
    }
};

Snake.prototype.moveRight = function(snake) {
    if (snake.hasChildNodes()) {
        var node = snake.removeChild(snake.firstChild);
        node.style.top = snake.lastChild.style.top;
        node.style.left = snake.lastChild.offsetLeft + this.blockSize + 'px';
        snake.appendChild(node);
    }
};

Snake.prototype.automate = function(event) {
    var target = event.target;
    var snakeBlocks = target.childNodes[1];

    // Set boundary for snake to roam
    var left = target.offsetLeft + ( target.offsetWidth / 4);
    var top = target.offsetTop + ( target.offsetHeight / 2);

    var saveThis = this;

    var counter = 0;
    var level = parseInt(snakeBlocks.className);

    saveThis.intervalID = setInterval( function() {
        switch ( counter++ ) {
            case 0:
                saveThis.addSnakeBlock(snakeBlocks, top, left);
                break;
            case 1:
                saveThis.addSnakeBlock(snakeBlocks, top - saveThis.blockSize, left);
                break;
            case 2:
                saveThis.addSnakeBlock(snakeBlocks, top - (2 * saveThis.blockSize), left);
                break;
            case 3:
            case 4:
                saveThis.moveRight(snakeBlocks);
                break;
            case 5:
            case 6:
                saveThis.moveDown(snakeBlocks);
                break;
            case 7:
            case 8:
                if (snakeBlocks.firstChild) { snakeBlocks.removeChild(snakeBlocks.firstChild); }
                break;
            case 9:
            default :
                if (snakeBlocks.firstChild) { snakeBlocks.removeChild(snakeBlocks.firstChild); }
                counter = 0;
                break;
        }
    }, (600 / level) );
};

Snake.prototype.stopAutomate = function(event) {

    clearInterval(this.intervalID);

    var snakeBlocks = event.target.childNodes[1];
    if ( snakeBlocks ) {
        while (snakeBlocks.firstChild) {
            snakeBlocks.removeChild(snakeBlocks.firstChild);
        }
    }
};

/**************** End of Snake Object ***********************************/

/**************** Page - HTML Rendering Object ***************************/

function Page() {
    this.sectionMain = document.querySelector('section.game-main');
    this.sectionScores = document.querySelector('section.game-scores');
    this.sectionContent = document.querySelector('section.game-content');

    this.displayGameScoresTable();
};

Page.prototype.displayGameScoresTable = function() {
    if ( !this.sectionScores.hasChildNodes() ) {
        createElement.call(this, 'p', this.sectionScores, 'LOADING...');

        var table = createElement.call(this, 'table', this.sectionScores);
        table.setAttribute('id', 'scores');

        var thead = createElement.call(this, 'thead', table);

        var tr = createElement.call(this, 'tr', thead);

        createElement.call(this, 'th', tr, 'SLUG');
        createElement.call(this, 'th', tr, 'WORM');
        createElement.call(this, 'th', tr, 'PYTHON');

        for ( var i = 1; i <= 10; i++ ) {
            tr = createElement.call(this, 'tr', table);

            createElement.call(this, 'td', tr, i + '. ...');
            createElement.call(this, 'td', tr, '...');
            createElement.call(this, 'td', tr, '...');
        }

        createElement.call( this, 'p', this.sectionScores, '> NEW GAME <', {id: 'new-game'} );
    }
};

Page.prototype.updateLoadingPage = function(n1) {
    switch (n1) {
        case 1:
            this.sectionMain.style.display = 'inline-block';
            this.sectionScores.style.display = "none";
            this.sectionContent.style.display = "none";
            break;
        case 2:
            this.sectionMain.style.display = "none";
            this.sectionScores.style.display = "inline-block";
            this.sectionContent.style.display = "none";
            break;
        case 3:
            this.sectionMain.style.display = "none";
            this.sectionScores.style.display = "none";
            this.sectionContent.style.display = 'inline-block';
            break;
        default:
            break;
    }
};

Page.prototype.createElement = function(elementType, parent, innerHtml, custom){
    var element = document.createElement(elementType);

    if ( parent ) { parent.appendChild(element); }

    if ( innerHtml ) { element.innerHTML = innerHtml; }

    if ( typeof custom !== 'undefined' ) {
        for ( var prop in custom ) {
            element.setAttribute( prop, custom[prop] );
        }
    }

    return element;
};
/**************** End of Page - HTML Rendering Object *******************/

(function() {
    var htmlPages = new Page()
    var snake = new Snake();

    // Register Event Listener click on game high scores
    document.querySelector('p#hscores').addEventListener('click', function() { htmlPages.updateLoadingPage(2); });
    document.querySelector('p#new-game').addEventListener('click', function() { htmlPages.updateLoadingPage(1); });

    document.querySelector('div#slug').addEventListener('click', function(e) {
        snake.stopAutomate(e);
        htmlPages.updateLoadingPage(3);
        snake.init();
    });
    document.querySelector('div#worm').addEventListener('click', function(e) {
        snake.stopAutomate(e);
        htmlPages.updateLoadingPage(3);
        snake.init();
    });
    document.querySelector('div#python').addEventListener('click', function(e) {
        snake.stopAutomate(e);
        htmlPages.updateLoadingPage(3);
        snake.init();
    });

    document.querySelector('div#slug').addEventListener('mouseenter', function(e) { snake.automate(e); });
    document.querySelector('div#worm').addEventListener('mouseenter', function(e) { snake.automate(e); });
    document.querySelector('div#python').addEventListener('mouseenter', function(e) { snake.automate(e); });

    document.querySelector('div#slug').addEventListener('mouseleave', function(e) { snake.stopAutomate(e); });
    document.querySelector('div#worm').addEventListener('mouseleave', function(e) { snake.stopAutomate(e); });
    document.querySelector('div#python').addEventListener('mouseleave', function(e) { snake.stopAutomate(e); });

    window.addEventListener('keydown', function(event) {
        // top = 38, right = 39, left = 37, down = 40
        if ( snake.direction ) {
            /* 0 = not playing, 1 = move down, 2 = move up, 3 = move left, 4 = move right */
            switch ( event.keyCode ) {
                case 37:
                    snake.direction = 3;
                    break;
                case 38:
                    snake.direction = 2;
                    break;
                case 39:
                    snake.direction = 4;
                    break;
                case 40:
                    snake.direction = 1;
                    break;
                default :
                    break;
            }
        }
    });

}());