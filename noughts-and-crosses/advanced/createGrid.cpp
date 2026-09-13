#include <iostream>
#include <string>

using namespace std;

extern string grid[3][3];
extern int currentTurn;
extern bool isGameActive;
extern string PLAYER1;
extern string PLAYER2;
extern string TITLE;
extern string BORDER;
extern string RESET;
extern string p1name;
extern string p2name;

void createGrid() {
    system("clear"); /* Clears previous game states from the console */

    cout << "          ╔═══════════════════════════╗ " << endl;
    cout << "          ║" << TITLE << "     NOUGHTS & CROSSES     " << RESET << "║" << endl;
    cout << "          ╚═══════════════════════════╝\n" << endl;
    cout << "                    1   2   3\n"; /* Adds 1-3 to the top of the cells */
    cout << BORDER <<"                  ┌───┬───┬───┐\n" << RESET; /* Adds the top border */

    for (int y = 0; y < 3; y++) {
        cout << "               " << char('A' + y) << BORDER << "  │ " << RESET; /* Adds A-C down the left side of the cells */

        for (int x = 0; x < 3; x++) {
            if (grid[y][x] == " ") cout << " "; /* Allows the cells to be blank initially */
            else cout << grid[y][x]; /* Prints player piece */
            if (x < 2) cout << BORDER << " │ " << RESET; /* Adds column dividers between the cells */
        }

        cout << BORDER << " │\n" << RESET; /* Adds the Right border */
        if (y < 2) cout << BORDER << "                  ├───┼───┼───┤\n" << RESET; /* Adds row dividers between the cells */
    }

    cout << BORDER << "                  └───┴───┴───┘\n" << RESET << endl; /* Adds the bottom border */

    if (isGameActive) { /* States whos turn it is */
        if (currentTurn == 1) cout << "  " << PLAYER1 << p1name << RESET << ": Enter the cell you'd like to place your piece in (e.g a1 or c3): ";
        else cout << "  " << PLAYER2 << p2name << RESET << ": Enter the cell you'd like to place your piece in (e.g a1 or c3): ";
    }
}