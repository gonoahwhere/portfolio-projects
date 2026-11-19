// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Every colour used in the app lives here, so a palette change is a one file job
// Nothing ever creates an AppColours object, it is just a shelf to read colours from
class AppColours {
    // The page background behind everything
    static const Color background = Color(0xFF05060C);
    
    // Panels sitting on top of the background
    static const Color panel = Color(0xFF0A0D18);
    static const Color panel2 = Color(0xFF0D1120);

    // Faint border for panels and list rows
    static const Color border = Color(0x2E8CA0FF);

    // Stronger border
    static const Color borderStrong = Color(0x598CA0FF);

    // Normal text colour
    static const Color text = Color(0xFFE7EAF6);

    // Quiet accent colour (subheadings, secondary buttons);
    static const Color textDim = Color(0xFF8A90B3);

    // Quietest text (hints, disabled)
    static const Color textFaint = Color(0xFF565C80);

    // Bright white text
    static const Color white = Color(0xFFEEF0FA);

    // Main accent colours (title, main buttons)
    static const Color cyan = Color(0xFF5EEAD4);
    static const Color violet = Color(0xFF9C8CFF);
    static const Color amber = Color(0xFFFF8C42);
    static const Color lightAmber = Color(0xFFFFB454);
    static const Color lightYellow = Color(0xFFEEE385);
    static const Color yellow = Color(0xFFE8DA5C);
    static const Color lime = Color(0xFF86FF91);
    static const Color pink = Color(0xFFFF6FA5);
    static const Color red = Color(0xFFFF3366);
    static const Color blurple = Color(0xFF5865F2);

    // Shadow colours for the 3D effect
    // These are solid (not see-through) on purpose due to stacked
    // see-through shadows overlap and show stripes where they cross
    static const Color cyanShadow = Color(0xFF1F6B60);
    static const Color violetShadow = Color(0xFF463F73);
    static const Color amberShadow = Color(0xFF733F1E);
    static const Color lightAmberShadow = Color(0xFF735126);
    static const Color lightYellowShadow = Color(0xFF6B663C);
    static const Color yellowShadow = Color(0xFF686229);
    static const Color limeShadow = Color(0xFF3C7341);
    static const Color pinkShadow = Color(0xFF73324A);
    static const Color redShadow = Color(0xFF73172E);
    static const Color blurpleShadow = Color(0xFF282D6D);
    static const Color termDotShadow = Color(0xFF1A1C29);

    // Edge colour for normal text
    // Lighter than textDimShadow, so white text and grey-blue text each get their own edge
    static const Color textShadow = Color(0xFF5A6099);
    static const Color whiteShadow = textShadow;
    static const Color textDimShadow = Color(0xFF3A4075);
    static const Color textFaintShadow = Color(0xFF272A3A);
} 