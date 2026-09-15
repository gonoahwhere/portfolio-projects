#include <iostream>
#include <string>
using namespace std;

char grid[3][3] = {}; /* Generates empty cells at the beginning of a game */
int currentTurn = 1; /* Player 1 starts first */
int filled = 0; /* No cells are filled at the start of a game */
char piece = 'X'; /* Player 1 plays as X */
string errorMessage = ""; /* Empty string, useful for things like cells are already in use */
char recentTurn; /* Stores the most recent turn */
bool hasWon = false; /* For determining a winner */
char input; /* Stores the arguments the user types */
bool isGameActive = true; /* Tracks if the game is active or not */

void replayGame() {
    for (int y = 0; y < 3; y++)
        for (int x = 0; x < 3; x++)
            grid[y][x] = 0;

    currentTurn = 1;
    filled = 0;
    piece = 'X';
    isGameActive = true;
    hasWon = false;
}

void createGrid() {
    system("clear"); /* Clears previous game states from the console (system('clear') for macOS)*/

    cout << "\nBasic Noughts & Crosses\n" << endl; /* Adds a title */

    if (isGameActive) cout << "Player " << currentTurn << "'s Turn: Enter the cell you'd like to place your piece in (e.g a1 or c3)\n" << endl; /* States whos turn it is */

    cout << "     1   2   3\n"; /* Adds 1-3 to the top of the cells */
    cout << "   +-----------+\n"; /* Adds the top border */

    for (int y = 0; y < 3; y++) {
        cout << char('A' + y) << "  | "; /* Adds A-C down the left side of the cells */

        for (int x = 0; x < 3; x++) {
            if (grid[y][x] == 0) cout << " "; /* Allows the cells to be blank initially */
            else cout << grid[y][x]; /* Prints player piece */
            if (x < 2) cout << " | "; /* Adds column dividers between the cells */
        }

        cout << " |\n"; /* Adds the Right border */
        if (y < 2) cout << "   |---+---+---|\n"; /* Adds row dividers between the cells */
    }

    cout << "   +-----------+\n" << endl; /* Adds the bottom border */
}

void turnTaking() {
    string command;
    getline(cin, command);

    if (command.length() >= 2) {
        int y = toupper(command[0]) - 'a'; /* Allows the game to know which row to place piece into */
        int x = command[1] - '1'; /* Allows the game to know which column to place piece into */

        if (x >= 0 && x < 3 && y >= 0 && y < 3) {
            if (grid[y][x] == 0) { /* If x and y positions are valid, checks if cell is empty */
                piece = (currentTurn == 1) ? 'X' : 'O'; /* Checks whos turn it is to determine which piece to play */
                grid[y][x] = piece; /* Places the correct piece into the coordinates given */
                filled++;
                recentTurn = piece; /* This is the piece that was just played */
                currentTurn = (currentTurn == 1) ? 2 : 1; /* Changes turn from player 1 to player 2 (or vice versa) */
            }

            else {
                errorMessage = "That cell has been used, try again!\n"; /* If cell isn't empty, displays a message to the player allowing for a retry */
            }
        }

        else {
            errorMessage = "That isn't a valid cell, try again!\n"; /* If the position provided isn't valid, allows for a retry */
        }
    }
}

void errorChecking() {
    if (!errorMessage.empty()) {
        cout << errorMessage << "\n"; /* Prints error under game */
        errorMessage = ""; /* Resets after printing to prevent issues reuing */
    }
}

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
        if (hasWon) cout << "Player " << ((recentTurn == 'X') ? 1 : 2) << " has earned their victory!" << endl;
        else if (filled == 9) cout << "Game ended with a tie, no winners this time!" << endl;
    }
}

int main() {

    while (true) {
        replayGame(); /* resets board for new game */

        while (isGameActive) {
            createGrid();
            errorChecking();
            turnTaking();
            isGameOver();
        }

        cout << "\nPress [R] to replay or [F] to quit: ";
        cin >> input;
        input = toupper(input);

        if (input == 'r') continue; /* Restarts the game */
        if (input == 'f') break; /* Exits the game */
    }

    cout << "\nGame over. Variables cleared. Memory freed. Thanks for playing, human!\n" << endl;
}
