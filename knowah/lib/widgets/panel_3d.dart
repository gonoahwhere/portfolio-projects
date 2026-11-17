// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// A box with a solid 3D edge, for anything that isn't a button
// (list rows, cards, info panels, dialogs)
// StatelessWidget because it never changes, there is no pressed state
class Panel3D extends StatelessWidget {
    // Whatever goes inside the box
    final Widget child;

    // Space between the box's border and what's inside it
    final EdgeInsetsGeometry padding;

    // Border colour (see-through, so it stays subtle)
    final Color borderColour;

    // Colour of the 3D edge
    final Color edgeColour;

    // How many pixels thick the 3D edge is
    final double depth;

    const Panel3D({
        super.key,
        required this.child,
        this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        this.borderColour = AppColours.border,
        this.edgeColour = AppColours.textDimShadow,
        this.depth = 5,
    });

    @override
    Widget build(BuildContext context) {
        return Container(
            padding: padding,
            decoration: BoxDecoration(
                // Solid fill so the 3D edge can't show through
                color: AppColours.background,
                // Slightly rounded corners, smae as the buttons
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: borderColour, width: 2),
                // The 3D edge: a sharp shadow down and right
                boxShadow: [
                    BoxShadow(
                        color: edgeColour,
                        offset: Offset(depth, depth),
                        blurRadius: 0,
                    ),
                ],
            ),
            child: child,
        );
    }

}