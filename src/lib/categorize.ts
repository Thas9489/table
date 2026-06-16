/**
 * categorize.ts
 * Local keyword-matching utility for instant transaction category detection.
 * Used as the fast-path before the AI edge function is called.
 */

export type AutoCategorySource = 'keyword' | 'ai' | null

interface CategoryRule {
  /** Exact DB category name (matched case-insensitively against the DB). */
  name: string
  /** Keywords — longer/more-specific phrases should come first for priority. */
  keywords: string[]
}

const RULES: CategoryRule[] = [
  {
    name: 'Food',
    keywords: [
      'restaurant', 'cafe', 'coffee', 'breakfast', 'lunch', 'dinner',
      'pizza', 'burger', 'kfc', 'mcdonalds', "mcdonald's", 'grocery',
      'groceries', 'supermarket', 'food', 'takeout', 'takeaway', 'sushi',
      'starbucks', 'bakery', 'diner', 'fast food', 'donut', 'sandwich',
      'salad', 'noodle', 'pasta', 'shawarma', 'kebab', 'taco', 'canteen',
    ],
  },
  {
    name: 'Transport',
    keywords: [
      'uber', 'careem', 'taxi', 'fuel', 'petrol', 'diesel', 'bus', 'metro',
      'parking', 'transport', 'car wash', 'lyft', 'grab', 'toll', 'train',
      'flight', 'airline', 'airport', 'subway', 'transit', 'gasoline',
      'highway', 'ride', 'fare', 'commute',
    ],
  },
  {
    name: 'Entertainment',
    keywords: [
      'netflix', 'spotify', 'youtube', 'cinema', 'movie', 'gaming',
      'playstation', 'xbox', 'nintendo', 'entertainment', 'concert',
      'theater', 'theatre', 'disney', 'hulu', 'streaming', 'apple tv',
      'prime video', 'twitch', 'steam', 'game pass', 'ticket',
      'amusement', 'museum', 'zoo',
    ],
  },
  {
    name: 'Health',
    keywords: [
      'hospital', 'clinic', 'pharmacy', 'doctor', 'medicine', 'medical',
      'dentist', 'health', 'checkup', 'fitness', 'gym', 'vitamin',
      'prescription', 'therapy', 'mental health', 'dental', 'optician',
      'eye care', 'blood test', 'lab', 'physiotherapy', 'massage',
      'protein', 'supplement',
    ],
  },
  {
    name: 'Education bill',
    keywords: [
      'school', 'college', 'university', 'tuition', 'course', 'training',
      'certification', 'exam', 'education', 'textbook', 'udemy',
      'coursera', 'edx', 'skillshare', 'tutorial', 'workshop',
      'learning', 'class', 'academy', 'seminar', 'student', 'degree',
    ],
  },
  {
    name: 'Bills',
    keywords: [
      'electricity', 'water bill', 'internet bill', 'wifi bill',
      'mobile bill', 'phone bill', 'utility', 'rent', 'bill payment',
      'gas bill', 'cable', 'insurance', 'monthly fee', 'annual fee',
      'broadband', 'electric', 'water utility',
    ],
  },
  {
    name: 'Shopping',
    keywords: [
      'amazon', 'shopping', 'clothes', 'clothing', 'shoes', 'sneakers',
      'mall', 'electronics', 'accessories', 'fashion', 'ebay',
      'aliexpress', 'retail', 'wardrobe', 'outfit', 'gadget', 'ikea',
      'furniture', 'home decor', 'purchase', 'order', 'delivery',
      'noon', 'shein', 'zara', 'h&m',
    ],
  },
  {
    name: 'Income',
    keywords: [
      'salary', 'bonus', 'freelance', 'payment received', 'income',
      'commission', 'reimbursement', 'paycheck', 'dividend', 'revenue',
      'earnings', 'wages', 'stipend', 'refund', 'cashback', 'transfer in',
      'wire received', 'deposit',
    ],
  },
]

/**
 * Detect category from a transaction description using keyword matching.
 *
 * Returns the exact DB category name string (e.g. "Education bill"), or
 * `null` if no keyword matches. "Other" is never returned — the caller
 * decides the fallback.
 *
 * Matching is case-insensitive and checks whether the description *contains*
 * the keyword (not exact equality), so "starbucks coffee" still matches.
 */
export function detectCategoryFromKeywords(description: string): string | null {
  if (!description || description.trim().length < 2) return null

  const lower = description.toLowerCase().trim()

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return rule.name
      }
    }
  }

  return null
}
