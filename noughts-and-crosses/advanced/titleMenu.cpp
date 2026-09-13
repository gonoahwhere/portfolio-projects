#include <iostream>
#include <string>

using namespace std;

extern string TITLE;
extern string TIE;
extern string RESET;

void showTitleScreen() { /* Creates a title screen, with options for the user */
    system("clear");

    cout << " ╔══════════════════════════════════════╗ " << endl;
    cout << " ║" << TITLE << "     WELCOME TO NOUGHTS & CROSSES     " << RESET << "║" << endl;
    cout << " ╚══════════════════════════════════════╝\n" << endl;
    cout << TIE << "    [I]" << RESET << " Instructions" << endl;
    cout << TIE << "    [P]" << RESET << " Play" << endl;
    cout << TIE << "    [S]" << RESET << " Statistics" << endl;
    cout << TIE << "    [O]" << RESET << " Options" << endl;
    cout << TIE << "    [Q]" << RESET << " Quit" << endl;
    cout << "\n  Press one of the corresponding keys above to get started: ";
}