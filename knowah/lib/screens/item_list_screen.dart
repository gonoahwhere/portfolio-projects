// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// The Item made in another file
import 'package:knowah/models/item.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// The main that wraps the screen (sidebar for PC)
import 'package:knowah/widgets/app_shell.dart';

// The 3D box, text and button
import 'package:knowah/widgets/panel_3d.dart';
import 'package:knowah/widgets/text_3d.dart';
import 'package:knowah/widgets/button_3d.dart';

// The screen that shows one item on its own
import 'package:knowah/screens/item_details_screen.dart';

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
            // AppShell adds the sidebar on a wide window
            body: AppShell(
                // The Items entry lights up cyan
                active: 'Items',
                // Padding keeps the content away from the edges
                child: Padding(
                    padding: const EdgeInsets.all(16),
                    // LayoutBuilder tells us how much width the content has
                    child: LayoutBuilder(
                        builder: (context, constraints) {
                            // Wider than 700 pixels counts as a PC layout
                            final isWide = constraints.maxWidth > 700;

                            if (isWide) {
                                // PC: the list on the left, the details panel on the right
                                return Row(
                                    // Lines up the tops of both sides
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        // flex: 2 means the list gets twice the share of the details panel
                                        // true tells the list the details panel is showing
                                        Expanded(flex: 2, child: _list(true)),
                                        // A thin line splitting the list from the details
                                        const SizedBox(width: 24),
                                        Container(
                                            width: 1,
                                            height: double.infinity,
                                            color: AppColours.border,
                                        ),
                                        const SizedBox(width: 24),
                                        Expanded(flex: 1, child: _details()),
                                    ],
                                );
                            }

                            // Mobile: only the list
                            // false tells the list there is no details panel
                            return _list(false);
                        },
                    ),
                ),
            ),
        );
    }

    // The back button and the list of items
    Widget _list(bool isWide) {
        // ListView is a scrolling list
        return ListView(
            // Room for the 3D edges on the right and bottom
            // A ListView cuts off anything drawn outside itself
            // so without this, the edges would be sliced off
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
                for (final item in widget.items) _itemRow(item, isWide),
            ],
        );
    }

    // One row in the list
    Widget _itemRow(Item item, bool isWide) {
        return Padding(
            // Space between one row and the next
            // Bigger than 8 so the 3D edges don't touch the next row
            padding: const EdgeInsets.only(bottom: 14),
            child: Panel3D(
                // The selected row stays cyan
                filled: _selected == item,
                // Panel3D also lights up cyan while held, because onTap is given
                onTap: () {
                    if (isWide) {
                        // The details panel is showing, so just fill it
                        // setState tells Flutter to redraw with the new selected item
                        setState(() => _selected = item);
                    } else {
                        // No room for the panel, so open the details on their own screen
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => ItemDetailsScreen(item: item),
                            ),
                        );
                    }
                },
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
            child: Column(
                // The name tag the TC08 test uses to find this panel
                key: const Key('details-panel'),
                // Only as tall as its contents
                mainAxisSize: MainAxisSize.min,
                // Makes each box stretch the full width of the panel
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                    // Small heading, above the boxes
                    const Text3D(
                        'ITEM DETAILS',
                        colour: AppColours.textDim,
                        fontSize: 14,
                    ),
                    const SizedBox(height: 12),

                    // Box 1: the selected item's title, or a message if nothing is selected
                    Panel3D(
                        child: Text3D(
                            colour: AppColours.text,
                            _selected?.title ?? 'Select an item'
                        ),
                    ),
                ],
            ),
        );
    }
}