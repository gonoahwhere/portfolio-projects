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

void showInstructions() {
    system("clear");

    cout << " ╔══════════════════════╗ " << endl;
    cout << " ║" << TITLE << "     INSTRUCTIONS     " << RESET << "║" << endl;
    cout << " ╚══════════════════════╝\n" << endl;
    cout << SUB << "  PLAYING:" << RESET << endl;
    cout << "     To get started with Noughts & Crosses, press " << TIE << "[P]" << RESET << " to start the game." << endl;
    cout << "     To make a move, you need to type the coordinates of the cell you'd like to place your piece such as a3 or c1." << endl;
    cout << "     The game will automatically change turn once a piece has been placed." << endl;
    cout << "     You continue playing until a winner has been determined or until all cells are filled." << endl;
    cout << "     After the game has finished, you will be asked if you want to replay, go back to title screen or quit the game." << endl;
    cout << "     You can view statistics such as how many games, wins and losses you have in the Stats menu which is found on the title screen.\n" << endl;
    cout << SUB << "  KEYBINDS:" << RESET << endl;
    cout << SUB2 << "     Title Screen" << RESET << endl;
    cout << TIE << "       [I]" << RESET << " To bring up this beautiful menu." << endl;
    cout << TIE << "       [P]" << RESET << " To start an active game." << endl;
    cout << TIE << "       [S]" << RESET << " To view game statistics." << endl;
    cout << TIE << "       [Q]" << RESET << " To quit the game.\n" << endl;
    cout << SUB2 << "     Playing" << RESET << endl;
    cout << TIE << "       [R]" << RESET << " Replay the game with the current settings." << endl;
    cout << TIE << "       [B]" << RESET << " To go back to the title screen." << endl;
    cout << TIE << "       [Q]" << RESET << " To quit the game.\n" << endl;
    cout << SUB2 << "     Options" << RESET << endl;
    cout << TIE << "       [N]" << RESET << " To change the name of " << PLAYER1 << "player 1" << RESET << "." << endl;
    cout << TIE << "       [O]" << RESET << " To change the piece of " << PLAYER1 << "player 1" << RESET << "." << endl;
    cout << TIE << "       [A]" << RESET << " To change the name of " << PLAYER2 << "player 2" << RESET << "." << endl;
    cout << TIE << "       [H]" << RESET << " To change the piece of " << PLAYER2 << "player 2" << RESET << "." << endl;
    cout << TIE << "       [B]" << RESET << " To go back to the title screen.\n" << endl;
    cout << SUB2 << "     End Game" << RESET << endl;
    cout << TIE << "       [R]" << RESET << " To replay the game." << endl;
    cout << TIE << "       [B]" << RESET << " To go back to the title screen." << endl;
    cout << TIE << "       [Q]" << RESET << " To quit the game." << endl;
    cout << "\n  Press " << BACK << "[B]" << RESET << " to go back to title screen: ";
}