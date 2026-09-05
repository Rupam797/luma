import 'package:flutter/material.dart';
import '../models/candidate.dart';

class SwipeScreen extends StatefulWidget {
  const SwipeScreen({super.key});

  @override
  State<SwipeScreen> createState() => _SwipeScreenState();
}

class _SwipeScreenState extends State<SwipeScreen> {
  final List<Candidate> _candidates = [
    Candidate(
      id: "1",
      fullName: "Sophia Martinez",
      age: 24,
      gender: "woman",
      bio: "Architect & coffee addict ☕. Looking for someone to explore hidden rooftop bars with ✨",
      photos: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600"],
      distanceKm: 3.2,
      city: "New York",
    ),
    Candidate(
      id: "2",
      fullName: "Elena Rostova",
      age: 26,
      gender: "woman",
      bio: "UX Designer 🎨. Passionate about live indie concerts, photography & weekend hiking 🏔️",
      photos: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600"],
      distanceKm: 5.1,
      city: "Brooklyn",
    ),
  ];

  int _currentIndex = 0;

  void _handleSwipe(String action) {
    if (_currentIndex >= _candidates.length) return;

    final candidate = _candidates[_currentIndex];

    // Simulate match trigger on like
    if (action == 'like' && _currentIndex == 0) {
      _showMatchDialog(candidate);
    }

    setState(() {
      _currentIndex++;
    });
  }

  void _showMatchDialog(Candidate candidate) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1C28),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "IT'S A MATCH!",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: Color(0xFFFF3366),
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "You and ${candidate.fullName.split(' ')[0]} liked each other",
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 50,
              backgroundImage: NetworkImage(candidate.photos.first),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF3366),
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text("Send a Message 💬", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final candidate = _currentIndex < _candidates.length ? _candidates[_currentIndex] : null;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFFF3366), Color(0xFFFF884D)]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.local_fire_department, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 8),
            const Text("luma", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 24)),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.tune), onPressed: () {}),
          IconButton(icon: const Icon(Icons.chat_bubble_outline), onPressed: () {}),
        ],
      ),
      body: candidate == null
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.style, size: 64, color: Colors.white24),
                  SizedBox(height: 16),
                  Text("You've seen everyone nearby!", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text("Expand your distance filter to see more profiles.", style: TextStyle(color: Colors.white50)),
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        image: DecorationImage(
                          image: NetworkImage(candidate.photos.first),
                          fit: BoxFit.cover,
                        ),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, Colors.black.withOpacity(0.85)],
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "${candidate.fullName}, ${candidate.age}",
                              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 16, color: Colors.white70),
                                const SizedBox(width: 4),
                                Text(
                                  "${candidate.city} • ${candidate.distanceKm} km away",
                                  style: const TextStyle(color: Colors.white70),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              candidate.bio,
                              style: const TextStyle(color: Colors.white90, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      IconButton.filled(
                        iconSize: 28,
                        padding: const EdgeInsets.all(16),
                        style: IconButton.styleFrom(backgroundColor: const Color(0xFF242738)),
                        icon: const Icon(Icons.close, color: Colors.redAccent),
                        onPressed: () => _handleSwipe('dislike'),
                      ),
                      IconButton.filled(
                        iconSize: 28,
                        padding: const EdgeInsets.all(16),
                        style: IconButton.styleFrom(backgroundColor: const Color(0xFF242738)),
                        icon: const Icon(Icons.star, color: Colors.blueAccent),
                        onPressed: () => _handleSwipe('superlike'),
                      ),
                      IconButton.filled(
                        iconSize: 32,
                        padding: const EdgeInsets.all(20),
                        style: IconButton.styleFrom(
                          backgroundGradient: const LinearGradient(colors: [Color(0xFFFF3366), Color(0xFFFF884D)]),
                        ),
                        icon: const Icon(Icons.favorite, color: Colors.white),
                        onPressed: () => _handleSwipe('like'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}
