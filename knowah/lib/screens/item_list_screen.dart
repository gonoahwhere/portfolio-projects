// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// The Item made in another file
import 'package:knowah/models/item.dart';

// The 3D box
import 'package:knowah/widgets/panel_3d.dart';

// The Item list shows every item in the project
// StatelessWidget means it never changes once it is drawn
class ItemListScreen extends StatelessWidget {
    // The items to show. They are handed in, so the screen doesn't care where they came from
    final List<Item> items;

    const ItemListScreen({super.key, required this.items});

    @override
    Widget build(BuildContext context) {
        // Scaffold is a blank page
        return Scaffold(
            // Padding keeps the list away from the edges of the window
            body: Padding(
                padding: const EdgeInsets.all(16),
                // ListView is a scrolling list
                child: ListView(
                    // Room for the 3D edges on the right and bottom
                    // A ListView cuts off anything drawn outside itself,
                    // so without this the edges would be sliced off
                    padding: const EdgeInsets.only(right: 5, bottom: 5),
                    children: [
                        // Makes one row for every item in the list
                        for (final item in items) _itemRow(item),
                    ],
                ),
            ),
        );
    }

    // One row in the list
    Widget _itemRow(Item item) {
        return Padding(
            // Space between one row and the next
            // Bigger than 8 so the 3D edges don't touch the next row
            padding: const EdgeInsets.only(bottom: 14),
            // The 3D panel
            child: Panel3D(
                // The item's title
                child: Text(item.title),
            ),
        );
    }
}