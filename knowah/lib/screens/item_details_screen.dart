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

// Shows one item on its own screen
// Used when the window is too narrow for the side panel
// StatelessWidget because it never changes once it is drawn
class ItemDetailsScreen extends StatelessWidget {
    // The item to show
    final Item item;

    const ItemDetailsScreen({super.key, required this.item});

    @override
    Widget build(BuildContext context) {
        // Scaffold is a blank page
        return Scaffold(
            // Padding keeps everything away from the edges of the dinwo
            body: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                    // The name tag the TC13 test uses to find this screen
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

                        // Small heading, above the boxes
                        const Text3D(
                            'ITEM DETAILS',
                            colour: AppColours.textDim,
                            fontSize: 14,
                        ),
                        const SizedBox(height: 12),

                        // Box 1: the item's title
                        Panel3D(child: Text3D(item.title)), 
                    ],
                ),
            ),
        );
    }
}