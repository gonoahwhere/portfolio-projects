// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// The Item made in another file
import 'package:knowah/models/item.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// The 3D box, text and button
import 'package:knowah/widgets/panel_3d.dart';
import 'package:knowah/widgets/text_3d.dart';
import 'package:knowah/widgets/button_3d.dart';

// The Item list shows every item in the project
// StatefulWidget because it changes while the app runs (which item is selected)
class ItemListScreen extends StatefulWidget {
    // The items to show. They are handed in, so the screen doesn't care where they came from
    final List<Item> items;

    const ItemListScreen({super.key, required this.items});

    @override
    State<ItemListScreen> createState() => _ItemListScreenState();
}

// This is the part that remembers which item is selected
class _ItemListScreenState extends State<ItemListScreen> {
    // The item the user tapped last (null means nothing is selected yet)
    Item? _selected;

    @override
    Widget build(BuildContext context) {
        // Scaffold is a blank page
        return Scaffold(
            // Padding keeps everything away from the edges of the window
            body: Padding(
                padding: const EdgeInsets.all(16),
                // LayoutBuilder tells us how much width we have to work with
                child: LayoutBuilder(
                    builder: (context, constraints) {
                        // Wider than 700 pixels counts as a PC layout
                        final isWide = constraints.maxWidth > 700;

                        if (isWide) {
                            // PC: the list on the left, the details panel on the right
                            // Row puts its children side by side
                            return Row(
                                // Lines up the tops of both sides
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    // Expanded shares out the width
                                    // flex: 2 means the list gets twice the share of the details panel
                                    Expanded(flex: 2, child: _list()),
                                    // Empty space between the two sides
                                    const SizedBox(width: 24),
                                    Expanded(flex: 1, child: _details()),
                                ],
                            );
                        }

                        // Mobile: only the list
                        return _list();
                    },
                ),
            ),
        );
    }

    // The back button and the list of items
    Widget _list() {
        // ListView is a scrolling list
        return ListView(
            // Room for the 3D edges on the right and bottom
            // A ListView cuts off anything drawn outside itself
            // so without this the edges would be sliced off
            padding: const EdgeInsets.only(right: 5, bottom: 5),
            children: [
                // Back button, in the top left
                // Align + SizedBox stop the button stretching the full width
                Align(
                    alignment: Alignment.centerLeft,
                    child: SizedBox(
                        width: 120,
                        child: Button3D(
                            label: 'Back',
                            // Navigator.pop closes this screen and goes back
                            onPressed: () => Navigator.pop(context),
                        ),
                    ),
                ),

                // Space between the button and the first row
                const SizedBox(height: 20),

                // Makes one row for every item in the list
                for (final item in widget.items) _itemRow(item),
            ],
        );
    }

    // One row in the list
    Widget _itemRow(Item item) {
        return Padding(
            // Space between one row and the next
            // Bigger than 8 so the 3D edges don't touch the next row
            padding: const EdgeInsets.only(bottom: 14),
            child: Panel3D(
                // The selected row stays cyan
                filled: _selected == item,
                // setState tells Flutter to redraw with the new selected item
                // Panel3D also lights up cyan while held, because onTap is given
                onTap: () => setState(() => _selected = item),
                // Row puts the title on the left and the status on the right
                child: Row(
                    children: [
                        // Expanded makes the title take all the free space
                        // which pushes the status over to the right edge
                        Expanded(child: Text3D(
                            colour: AppColours.text,
                            item.title
                            )
                        ),
                        // The status, in a quieter grey-blue colour
                        Text3D(
                            _statusLabel(item.status),
                            colour: AppColours.textDim,
                        ),
                    ],
                ),
            ),
        );
    }

    // Turns a status like ItemStatus.draft into the text 'Draft'
    String _statusLabel(ItemStatus status) {
        // status.name is 'draft', so capitilisation is needed for the first letter
        return status.name[0].toUpperCase() + status.name.substring(1);
    }

    // The details panel on the right (PC only)
    Widget _details() {
        return Padding(
            // Room for the 3D edge on the right and bottom
            padding: const EdgeInsets.only(right: 5, bottom: 5),
            child: Panel3D(
                // The name tag the TC08 test uses to find this panel
                key: const Key('details-panel'),
                child: Column(
                    // Only as tall as its contents
                    mainAxisSize: MainAxisSize.min,
                    // Lines up the text on the left
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                        // Small heading
                        const Text3D(
                            'DETAILS',
                            colour: AppColours.textDim,
                            fontSize: 14,
                        ),
                        const SizedBox(height: 12),

                        // The selected item's title, or a message if nothing is selected
                        Text3D(_selected?.title ?? 'Select an item'),
                    ],
                ),
            ),
        );
    }
}