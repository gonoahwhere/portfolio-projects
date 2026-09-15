#include <iostream>
#include <string>

using namespace std;

extern string grid[3][3];
extern int filled;
extern string recentTurn;
extern bool hasWon;
extern bool isGameActive;
extern string PLAYER1;
extern string PLAYER2;
extern string RESET;
extern string SUB2;
extern string p1name;
extern string p2name;
extern string p1piece;
extern int p1wins;
extern int p1losses;
extern int p2wins;
extern int p2losses;
extern int totalgames;
extern int totaldraws;

void createGrid();
void savingData();

void isGameOver() {
    for (int i = 0; i < 3; i++) {
        if (grid[i][0] == recentTurn && grid[i][1] == recentTurn && grid[i][2] == recentTurn) hasWon = true; /* Checks win state for rows */
        if (grid[0][i] == recentTurn && grid[1][i] == recentTurn && grid[2][i] == recentTurn) hasWon = true; /* Checks win state for columns */
    }

    if (grid[0][0] == recentTurn && grid[1][1] == recentTurn && grid[2][2] == recentTurn) hasWon = true; /* Checks win state from top left to bottom right diagonally */
    if (grid[0][2] == recentTurn && grid[1][1] == recentTurn && grid[2][0] == recentTurn) hasWon = true; /* Checks win state from top row to bottom left diagonally */

    if (hasWon) {
        isGameActive = false;
    }

    else if (filled == 9) {
        isGameActive = false;
    }

    if (!isGameActive) {
        createGrid();
        if (hasWon) {
            if (recentTurn == PLAYER1 + p1piece + RESET) {
                cout << "  " << PLAYER1 << p1name << RESET << " connected three points and disconnected the competition!" << endl;
                totalgames += 1;
                p1wins += 1;
                p2losses += 1;
                savingData();
            } 
            else {
                cout << "  " << PLAYER2 << p2name << RESET << " connected three points and disconnected the competition!" << endl;
                totalgames += 1;
                p2wins += 1;
                p1losses += 1;
                savingData();
            } 
        }
        else if (filled == 9) {
            cout << SUB2 << "  Game ended with a tie, no winners this time!" << RESET << endl;
            totaldraws += 1;
            totalgames += 1;
            savingData();
        }
    }
}