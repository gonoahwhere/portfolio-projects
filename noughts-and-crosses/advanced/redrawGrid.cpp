#include <string>
#include <iostream>

using namespace std;

extern string recentTurn;
extern bool hasWon;
extern int filled;
extern string PLAYER1;
extern string PLAYER2;
extern string RESET;
extern string SUB2;
extern string p1name;
extern string p2name;
extern string p1piece;

void createGrid();

void redrawEndGame() { /* Redraws the grid after game has ended */
    createGrid();

    if (hasWon) {
        if (recentTurn == PLAYER1 + p1piece + RESET) cout << "  " << PLAYER1 << p1name << RESET << " connected three points and disconnected the competition!" << endl;
        else cout << "  " << PLAYER2 << p2name << RESET << " connected three points and disconnected the competition!" << endl;
    }

    else if (filled == 9) {
        cout << SUB2 << "  Game ended with a tie, no winners this time!" << RESET << endl;
    }
}
