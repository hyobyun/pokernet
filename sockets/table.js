var Deck = require('./deck.js');

function Table(blind, limit, buyIn, io) {
  this.blind = blind;
  this.limit = limit;
  // player name, money
  this.players = [];
  this.cards = [];
  this.currentBet = blind;
  this.betQueue = [];
  this.io = io;
  this.pot = 0;
  this.numPlayers = 0;
  this.curPlayer;
}

Table.prototype.getInfo = function() {
    var info = "Blind: " + this.blind + " Limit: " + this.limit + "\nPlayers: ";
    for (var i = 0; i < this.players; i++) {
        info += this.players[0] + " \n";
    }
    return info;
}

/****Game flow management*****/

/*** Start round
tasks:
    - alert players of others at table
    - set the deck
    - give each player two cards
    - set bet queue
    - auto bet small, big blind
    - allow betting
****/

Table.prototype.startGame = function() {
    // alert players
    for (i = 0; i < this.numPlayers; i++) { 
        this.io.sockets.emit('getPlayer', 
                                    { id: this.players[i].id
                                    , bank: this.players[i].bank
                                    , name: this.players[i].name });
    }
    
    
    // set the deck
    this.deck = new Deck();
    
    // deal some hands
    this.dealPlayers();
    
    // set up bet queue
    this.constructQueue();
    
    // auto bet for the first two - small, then big blind - requeue small blind
    var lb = this.betQueue.shift();
    this.io.sockets.emit('betting', {pid: this.players[lb].id});
    this.players[lb].setBank(-this.blind/2);
    this.pot += (this.blind/2);
    this.io.sockets.emit('bet', { amount: (this.blind/2), player: this.players[lb].id});
    this.betQueue.push(lb); // will still need to bet
    
    var bb = this.betQueue.shift();
    this.io.sockets.emit('betting', {pid: this.players[bb].id});
    this.players[bb].setBank(-this.blind);
    this.pot += this.blind;
    this.io.sockets.emit('bet', { amount: (this.blind), player: this.players[bb].id });
    this.betQueue.push(bb);
    
    // now that this is done, we shift to bet phase
    this.getBet();
}

/**** The bet phase*****
    tasks:
        - take a bet
        - compare - if it <= bet recieved, we know we can move on
        ***/
Table.prototype.getBet = function() {
    this.curPlayer = this.betQueue.shift();
    this.io.sockets.emit('betting', {pid: this.players[this.curPlayer].id});
    this.io.sockets.socket(this.players[this.curPlayer].id).emit('alert', {text: 'It is your turn to bet'});
}

Table.prototype.takeBet = function(data) {
    // set their bet and bank
    
    this.players[this.curPlayer].setBet(data.amount);
    this.players[this.curPlayer].setBank(-data.amount);
    this.pot += data.bet;
    
    // Alert everyone
    this.io.sockets.emit('bet', {player: data.player, amount: data.amount});
    
    // if this bet = next, we've hit the end
    if (data.amount == this.currentBet) {
        console.log("Moving rounds...");
        // reset the bet queue
        // reset current bet and player bets
        this.currentBet = 0;
        for (player in this.players) {
            this.players[player].setBet(0);
            this.betQueue = [];
        }
        if (this.cards.length!=0) {
            console.log("table length " + this.cards.length);
             if (this.cards.length == 3) { // deal turn
                this.showTurn();
                this.constructQueue();
                this.getBet()
            } else if (this.cards.length == 4) { // deal river
                this.showRiver();
                this.constructQueue();
                this.getBet();
            } else { // end of game
            
            }
        } else { // we deal flop
            this.showFlop();
            this.constructQueue();
            this.getBet();
        }
        
    } else {
        // repush to end, set bet, move on
        
        this.betQueue.push(this.curPlayer);
        this.currentBet = data.amount;
        this.getBet();
    }
    
}

/****Player management*****/

// add a player to a table
Table.prototype.addPlayer = function(player) {
    this.players[this.numPlayers++] = player;
}

// deal a round of cards to a table
Table.prototype.dealPlayers = function() {

    //draw cards for all players
    for (i = 0; i < this.players.length; i++) {
        for (player in this.players) {
            this.players[player].setHand(this.deck.drawCard());
        }
    }
    
    // Send the hands, add to betting queue
    for (player in this.players) {
        var hand = this.players[player].getHand()
        this.io.sockets.socket(this.players[player].id).emit('getHand', hand);
    }
}

// get player index by id
Table.prototype.getPlayer = function(pid) {
    for (var i = 0; i < this.numPlayers; i++) {
        if (this.players[i] = pid) {
            return i;
        }
    }
}

// Aww, they give up
Table.prototype.fold = function() {
    
}

// get blind
Table.prototype.getBlind = function() {
    return this.blind;
}

// set up a queue to track bets
Table.prototype.constructQueue = function() {
    
    for (player in this.players) {
        this.betQueue.push(player);
    }
    
    // make sure dealer bets last
    this.betQueue.push(this.betQueue.shift()); 
}

// Card management

Table.prototype.showFlop = function() {
    this.cards[0] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[0]});
    this.cards[1] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[1]});
    this.cards[2] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[2]});
}

Table.prototype.showTurn = function() {
    this.cards[3] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[3]});
}

Table.prototype.showRiver = function() {
    this.cards[4] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[4]});

}


Table.prototype.findWinner = function() {

}



Table.prototype.transferPot = function() {

}

module.exports = Table;
