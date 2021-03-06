function Player(playerID, money, name) {
    this.id = playerID;
    this.name = name;
    this.tableID = "";
    this.hand = [];
    this.bank = money;
    this.currentBet = 0;
}

Player.prototype.getID = function() {
    return this.id;
}

Player.prototype.getName = function() {
    return this.name;
}

Player.prototype.setName = function(name) {
    this.name =  name;
}

Player.prototype.getTableID = function() {
    return this.tableID;
}

Player.prototype.setTableID = function(table) {
    this.tableID = table;
}

Player.prototype.getHand = function() {
    return this.hand;
}

Player.prototype.setHand = function(card) {
    if (this.hand[0] == null) this.hand[0] = card;
    else this.hand[1] = card;
}

Player.prototype.getBank = function() {
    return this.bank;
}

Player.prototype.setBank = function(amt) {
    this.bank += amt;
}

Player.prototype.setBet = function(amt) {
    this.currentBet = amt;
}

Player.prototype.getBet = function() {
    return this.currentBet;
}

module.exports = Player;
