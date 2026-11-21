// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// The Item and the Link made in another file
import 'package:knowah/models/item.dart';
import 'package:knowah/models/link.dart';

// The 3D button and the shared details boxes
import 'package:knowah/widgets/button_3d.dart';
import 'package:knowah/widgets/item_detail_boxes.dart';

// Shows one item on its own screen
// Used when the window is too narrow for the side panel
// StatelessWidget because it never changes once it is drawn
class ItemDetailsScreen extends StatelessWidget {
    // The item to show
    final Item item;

    // All the links, so the screen can show this item's links
    final List<Link> links;

    const ItemDetailsScreen({super.key, required this.item, this.links = const []});

    @override
    Widget build(BuildContext context) {
        // Scaffold is a blank page
        return Scaffold(
            // Padding keeps everything away from the edges of the dinwo
            body: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                    // The name tag the TC13 and TC17 tests use to find this screen
                    key: const Key('details-screen'),
                    // Makes each box stretch the full width
                    crossAxisAlignment: CrossAxisAlignment.stretch,
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
                        const SizedBox(height: 20),

                        // The same boxes the side panel uses
                        ItemDetailBoxes(item: item, links: links),
                    ],
                ),
            ),
        );
    }
}