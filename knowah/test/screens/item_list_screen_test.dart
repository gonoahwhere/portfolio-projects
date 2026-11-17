// Flutter's building blocks, needed to draw a test screen
import 'package:material_ui/material_ui.dart';

// testWidgets allows testing a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// The Item made in another file
import 'package:knowah/models/item.dart';

// This screen doesn't exist yet, so the test with fail (Red)
import 'package:knowah/screens/item_list_screen.dart';

void main() {
    // TC05: the list screen must show the title of every item it is given
    testWidgets('TC05: Item list shows the title of each item', (tester) async {
        // Two pretend items to show on the screen
        final items = [
            Item(title: 'Double Jump'),
            Item(title: 'Slime Enemy'),
        ];

        // Draw the screen with those items inside a minimal app
        await tester.pumpWidget(MaterialApp(home: ItemListScreen(items: items)));

        // Both titles should be somewhere on the screen
        expect(find.text('Double Jump'), findsOneWidget);
        expect(find.text('Slime Enemy'), findsOneWidget);
    });
}