import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/swipe_screen.dart';

void main() {
  runApp(const LumaApp());
}

class LumaApp extends StatelessWidget {
  const LumaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Luma',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0D0E15),
        primaryColor: const Color(0xFFFF3366),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF3366),
          secondary: Color(0xFFFF655B),
          surface: Color(0xFF1A1C28),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ),
        useMaterial3: true,
      ),
      home: const SwipeScreen(),
    );
  }
}
