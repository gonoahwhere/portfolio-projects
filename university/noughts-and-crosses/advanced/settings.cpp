#include <iostream>
#include <string>
using namespace std;

extern string TITLE;
extern string TIE;
extern string RESET;
extern string BACK;
extern string PLAYER1;
extern string PLAYER2;
extern string SUB;
extern string SUB2;
extern string p1name;
extern string p1piece;
extern string p2name;
extern string p2piece;

void showSettings() {
    system("clear");

    cout << " ╔═════════════════╗ " << endl;
    cout << " ║" << TITLE << "     OPTIONS     " << RESET << "║" << endl;
    cout << " ╚═════════════════╝\n" << endl;
    cout << TIE << "    [N]" << RESET << " Player 1's name:  " << PLAYER1 << p1name << RESET << endl;
    cout << TIE << "    [O]" << RESET << " Player 1's piece: " << PLAYER1 << p1piece << RESET << endl;
    cout << TIE << "    [A]" << RESET << " Player 2's name:  " << PLAYER2 << p2name << RESET << endl;
    cout << TIE << "    [H]" << RESET << " Player 2's piece: " << PLAYER2 << p2piece << RESET << endl;
    cout << "\n  Press one of the corresponding keys or " << BACK << "[B]" << RESET << " to go back to title screen: ";
}
