// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// The Item and the Link, with their statuses and types
import 'package:knowah/models/item.dart';
import 'package:knowah/models/link.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// The 3D box, text and button
import 'package:knowah/widgets/panel_3d.dart';
import 'package:knowah/widgets/text_3d.dart';
import 'package:knowah/widgets/button_3d.dart';

// Turns a status like ItemStatus.draft into the text 'Draft'
String statusLabel(ItemStatus status) {
    // status.name is 'draft', so capitilisation is needed for the first letter
    return status.name[0].toUpperCase() + status.name.substring(1);
}

// Turns a link type like LinkType.introducedIn into the text 'Introduced In'
String linkLabel(LinkType type) {
    switch (type) {
        case LinkType.introducedIn:
            return 'Introduced In';
        case LinkType.appearsIn:
            return 'Appears In';
        case LinkType.blocks:
            return 'Blocks';
        case LinkType.fixes:
            return 'Fixes';
        case LinkType.relatedTo:
            return 'Related To';
    }
}

// The heading and boxes that describe one item
// Used by the side panel and the details screen, so they always match
// StatelessWidget because it never changes one it is drawn
class ItemDetailBoxes extends StatelessWidget {
    // The item to describe (null means nothing is selected yet)
    final Item? item;

    // All the links, only show the ones that start from this item
    final List<Link> links;

    const ItemDetailBoxes({super.key, required this.item, this.links = const []});
    
    @override
    Widget build(BuildContext context) {
        // A local copy, so Dart knows it isn't null inside the if below
        final current = item;

        return Column(
            // Only as tall as its contents
            mainAxisSize: MainAxisSize.min,
            // Makes each box stretch the full width
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
                // Small heading, above the boxes
                const Text3D(
                    'ITEM DETAILS',
                    colour: AppColours.textDim,
                    fontSize: 14,
                ),
                const SizedBox(height: 12),

                // Box 1: the title, or a message if nothing is selected
                Panel3D(child: Text3D(current?.title ?? 'Select an item')),

                // The rest only shows once an item is selected
                if (current != null) ...[
                    // Box 2: the status
                    const SizedBox(height: 14),
                    Panel3D(child: Text3D(statusLabel(current.status))),

                    // One box for every link that starts from this item
                    for (final link in links.where((l) => l.from == current)) ...[
                        const SizedBox(height: 14),
                        Panel3D(
                            // For example: introduced in → Level 2
                            child: Text3D('${linkLabel(link.type)} → ${link.to.title}'),
                        ),
                    ],
                ],
            ],
        );
    }
}