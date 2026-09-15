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
extern string p2name;
extern string p1piece;
extern string p2piece;
extern int p1wins;
extern int p1losses;
extern int p2wins;
extern int p2losses;
extern int totalgames;
extern int totaldraws;

void loadingData();

void showStats() {
    system("clear");
    loadingData();

    cout << " ╔════════════════════╗ " << endl;
    cout << " ║" << TITLE << "     STATISTICS     " << RESET << "║" << endl;
    cout << " ╚════════════════════╝\n" << endl;
    cout << PLAYER1 << "  PLAYER 1: " << RESET << p1name << endl;
    cout << "  ───────────────────── " << endl;
    cout << PLAYER1 << "     Piece: " << RESET << p1piece << endl;
    cout << PLAYER1 << "     Wins: " << RESET << p1wins << endl;
    cout << PLAYER1 << "     Losses: " << RESET << p1losses << "\n" << endl;
    cout << PLAYER2 << "  PLAYER 2: " << RESET << p2name << endl;
    cout << "  ───────────────────── " << endl;
    cout << PLAYER2 << "     Piece: " << RESET << p2piece << endl;
    cout << PLAYER2 << "     Wins: " << RESET << p2wins << endl;
    cout << PLAYER2 << "     Losses: " << RESET << p2losses << "\n" << endl;
    cout << TIE << "  OVERALL GAMEPLAY: " << RESET << endl;
    cout << "  ───────────────────── " << endl;
    cout << TIE << "     Games Played: " << RESET << totalgames << endl;
    cout << TIE << "     Ties: " << RESET << totaldraws << endl;
    cout << "\n  Press " << BACK << "[B]" << RESET << " to go back to title screen: ";
}
