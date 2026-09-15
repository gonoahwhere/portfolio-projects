#include <iostream>
#include <string>

using namespace std;

extern string grid[3][3];
extern int currentTurn;
extern int filled;
extern bool hasWon;
extern bool isGameActive;

void replayGame() { /* Resets the game back to starting values */
    for (int y = 0; y < 3; y++)
        for (int x = 0; x < 3; x++)
            grid[y][x] = " ";

    currentTurn = 1;
    filled = 0;
    isGameActive = true;
    hasWon = false;
}