// drift/native.dart lets us make a database that lives only in memory
import 'package:drift/native.dart';

// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// The Database, Main Menu and Project that were made in earlier steps
import 'package:knowah/database/app_db.dart';
import 'package:knowah/models/project.dart';
import 'package:knowah/screens/menu_screen.dart';

void main() {
    // TC26: the recent projects on the Menu come from the database
    testWidgets('TC26: Recent projects come from the database', (tester) async {
        // A fresh, empty database that lives only in memory
        final database = AppDB(NativeDatabase.memory());

        // runAsync lets real database work happen inside a widget test
        // widget tests use fake clocks that can stop database work from running normallly
        await tester.runAsync(() async {
            await database.saveProject(Project(name: 'Side-Scroller'));
            await database.saveProject(Project(name: 'Card Battler'));
        });

        // Show the Menu, passing it the database
        // MenuScreen doesn't accept a database yet, so it won't compile right now
        await tester.pumpWidget(MaterialApp(home: MenuScreen(database: database)));

        // Give Menu a moment to finish reading from the database, then redraw
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();

        // Both saved project names should be on the screen
        expect(find.text('Side-Scroller'), findsOneWidget);
        expect(find.text('Card Battler'), findsOneWidget);

        // Close the database
        await tester.runAsync(() => database.close());
    });
}