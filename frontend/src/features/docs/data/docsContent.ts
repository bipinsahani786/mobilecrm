export type Language = 'en' | 'hi';

export interface DocSection {
  id: string;
  title: {
    en: string;
    hi: string;
  };
  icon: string;
  content: {
    en: string;
    hi: string;
  };
}

export const docsData: DocSection[] = [
  {
    id: "getting-started",
    title: {
      en: "Getting Started & Dashboard",
      hi: "शुरुआत कैसे करें (Dashboard)",
    },
    icon: "LayoutDashboard",
    content: {
      en: `
### Welcome to your Shop CRM!

The **Dashboard** gives you a quick summary of your business today. 

* **Pending Payments:** Total amount customers owe you (Udhar).
* **Staff Present:** Number of employees marked present today.
* **Low Stock Alerts:** Items that are running out of stock and need to be ordered.
* **Recent Activity:** A quick log of bills made and payments received.

**How to Start?**
1. Setup your business profile and upload your logo from **Settings**.
2. Add your **Staff** & configure their Payroll components.
3. Start adding **Products** in Inventory.
4. Go to **POS** to create your first bill!
      `,
      hi: `
### आपके शॉप CRM में आपका स्वागत है!

**Dashboard (डैशबोर्ड)** आपको आपकी दुकान का आज का पूरा हिसाब एक ही जगह दिखाता है।

* **Pending Payments:** वो कुल पैसा जो कस्टमर्स से उधार (Udhar) में लेना बाकी है।
* **Staff Present:** आज कितने कर्मचारी (Staff) काम पर आए हैं।
* **Low Stock Alerts:** वो सामान जो दुकान में खत्म होने वाला है और जिसका ऑर्डर देना है।
* **Recent Activity:** आज जो भी बिल बने या पेमेंट आई, उसकी ताज़ा जानकारी।

**शुरुआत कैसे करें?**
1. सबसे पहले **Settings** में जाकर अपनी दुकान का नाम और लोगो (Logo) सेट करें।
2. फिर अपने **Staff** (कर्मचारियों) को जोड़ें और उनकी सैलरी सेट करें।
3. अपनी दुकान का स्टॉक (**Inventory**) चढ़ाएं।
4. और फिर **POS** में जाकर अपना पहला बिल बनाएं!
      `
    }
  },
  {
    id: "pos-billing",
    title: {
      en: "POS & Billing (Udhar & EMI)",
      hi: "POS और बिलिंग (उधार और EMI)",
    },
    icon: "Monitor",
    content: {
      en: `
### Point of Sale (POS)

The POS module is where you create bills for your customers.

**Making a Bill:**
1. Select the items you want to sell. Enter the Serial/IMEI number if applicable.
2. Select the Customer (or add a new one on the spot).
3. The system will calculate the total. You can apply a discount if needed.

**Payment Methods:**
* **Cash/UPI/Card:** Standard full payments.
* **Udhar (Credit):** If the customer is not paying the full amount, select "Udhar" and enter how much they are paying today (Down payment). The rest goes to their Credit Ledger (Udhar Khata) and their invoice will show a red **CREDIT** stamp.
* **EMI (Finance):** If the customer is buying on EMI (e.g. Bajaj Finserv, TVS Credit), enter the Finance Company name, Loan amount, and Tenure. The remaining balance will show as "Paid by Finance" in green on the receipt.

**WhatsApp Sharing:**
After completing a sale, you can click "Share WhatsApp" to automatically send the invoice PDF link to the customer's phone!
      `,
      hi: `
### POS (बिल बनाने का सिस्टम)

POS में आप अपने कस्टमर्स के लिए बिल बनाते हैं।

**बिल कैसे बनाएं:**
1. जो सामान बेचना है उसे चुनें। अगर मोबाइल है तो उसका IMEI नंबर डालें।
2. कस्टमर का नाम चुनें (या तुरंत नया कस्टमर जोड़ लें)।
3. सिस्टम खुद ही टोटल बिल बता देगा। आप चाहें तो डिस्काउंट भी दे सकते हैं।

**पेमेंट के तरीके:**
* **Cash/UPI/Card:** अगर कस्टमर पूरा पैसा एक साथ दे रहा है।
* **Udhar (उधार):** अगर कस्टमर कुछ पैसा बाद में देगा, तो "Udhar" चुनें और आज जितना पैसा दे रहा है वो डाल दें। बाकी का पैसा उसके "उधार खाते" में जुड़ जाएगा और बिल पर लाल रंग का **CREDIT** स्टाम्प छपकर आएगा।
* **EMI (फाइनेंस):** अगर कस्टमर EMI पर फ़ोन ले रहा है (जैसे Bajaj, TVS), तो फाइनेंस कंपनी का नाम और लोन का अमाउंट डालें। बिल पर अपने आप "Paid by Finance" हरे रंग में छप जाएगा क्योंकि वो पैसा आपको कंपनी देगी।

**WhatsApp पर बिल भेजना:**
बिल बनने के बाद "Share WhatsApp" बटन दबाएं, बिल सीधा कस्टमर के मोबाइल पर चला जाएगा!
      `
    }
  },
  {
    id: "staff-payroll",
    title: {
      en: "Staff & Payroll (Salary)",
      hi: "स्टाफ और पेरोल (सैलरी)",
    },
    icon: "Users",
    content: {
      en: `
### Managing Staff, Attendance & Payroll (Full Guide)

This module is a complete **Help Desk** for calculating the end-of-month salary for your shop employees without manual calculations. It tracks their daily earnings, loans, commissions, and attendance penalties.

---

### 1. Daily Earnings & Attendance Logic

Before calculating the salary, the system determines the **Per Day Salary** of the staff based on the month.
* **Formula:** \`Daily Wage = (Basic Pay + Allowances) ÷ Total Days in the Month\`
* *(Example: If Basic Pay is ₹15,000 in a 30-day month, the Daily Wage is ₹500/day).*

**How Attendance Affects Salary:**
You must mark attendance daily (Present, Half Day, or Absent):
* **Present:** No deduction. (Earns full ₹500 for the day).
* **Half Day:** Half-day deduction. (Loses ₹250 for the day).
* **Absent:** Full day deduction. (Loses ₹500 for the day).

---

### 2. Salary Advances (Loans)

If a staff member asks for money during the month (e.g., ₹2000 for emergency):
1. Go to **HR -> Salary Advances** and issue the advance.
2. The system keeps this in a ledger.
3. At the end of the month, this ₹2000 is **automatically deducted** from their final salary.

---

### 3. Sales Commission

If you want to motivate your staff to sell more:
1. Go to Settings and set a Commission Rate (e.g., 2% on Profit or Sales).
2. When creating a bill in POS, select the Staff's name in the "Sold By" dropdown.
3. The system tracks all their sales. At the end of the month, their total commission is **automatically added** to their salary as a bonus!

---

### 4. The Final Payroll Formula

At the end of the month, go to **Payroll** and click "Generate Payroll". The system will look at the entire month's data and use this exact formula:

> **[+] Fixed Earnings:** (Basic Pay + Fixed Allowances)
> **[-] Attendance Penalties:** (Daily Wage × Total Absents) + (Daily Wage × 0.5 × Total Half Days)
> **[-] Fixed Deductions:** (Any PF, ESI, or fixed monthly penalties)
> **[-] Advances Taken:** (Money taken during the month)
> **[+] Total Commission:** (Earned from sales this month)
> 
> **= NET PAYABLE SALARY**

Once generated, you can print a detailed **Salary Slip** for the employee!
      `,
      hi: `
### स्टाफ की सैलरी, हाजिरी और पेरोल (पूरी जानकारी)

यह मॉड्यूल आपकी दुकान के कर्मचारियों की सैलरी का पूरा **Help Desk** है। यह बिना किसी कैलकुलेटर के उनके हर दिन की कमाई, उधार (Advance), कमीशन और छुट्टियों का खुद हिसाब रखता है।

---

### 1. रोज़ की कमाई और हाजिरी (Attendance) का लॉजिक

सैलरी बनाने से पहले, सिस्टम यह देखता है कि महीने में कितने दिन हैं और उस हिसाब से **1 दिन की सैलरी (Daily Wage)** निकालता है।
* **फॉर्मूला:** \`1 दिन की सैलरी = (बेसिक सैलरी + भत्ते) ÷ महीने के कुल दिन\`
* *(उदाहरण: अगर 30 दिन के महीने में बेसिक सैलरी ₹15,000 है, तो 1 दिन की सैलरी ₹500/दिन होगी)।*

**हाजिरी से सैलरी कैसे कटती है?:**
आपको रोज़ स्टाफ की हाजिरी लगानी होती है:
* **Present (आया है):** कोई पैसा नहीं कटेगा (पूरे ₹500 मिलेंगे)।
* **Half Day (आधे दिन):** आधे दिन के पैसे कटेंगे (₹250 कटेंगे)।
* **Absent (छुट्टी):** पूरे दिन के पैसे कटेंगे (₹500 कटेंगे)।

---

### 2. एडवांस सैलरी (Salary Advance)

अगर कोई कर्मचारी महीने के बीच में पैसे मांगता है (जैसे ₹2000 इमरजेंसी के लिए):
1. **HR -> Salary Advances** में जाकर उसे पैसे दें।
2. सिस्टम इसे अपने खाते में लिख लेगा।
3. महीने के अंत में जब सैलरी बनेगी, तो ये ₹2000 उसकी फाइनल सैलरी से **अपने आप कट (Deduct) जाएंगे**। आपको याद रखने की ज़रूरत नहीं!

---

### 3. सेल पर कमीशन (Sales Commission)

अगर आप चाहते हैं कि आपका स्टाफ ज़्यादा सेल करे:
1. Settings में जाकर कमीशन का रेट तय करें (जैसे 2%)।
2. जब भी कोई स्टाफ बिल बनाए (POS में), तो "Sold By" में उसका नाम चुनें।
3. पूरे महीने में उसने जितनी सेल की होगी, उसका टोटल कमीशन महीने के अंत में उसकी सैलरी में **अपने आप बोनस के तौर पर जुड़ जाएगा**!

---

### 4. फाइनल सैलरी का फॉर्मूला (Payroll Generation)

महीने के अंत में, **Payroll** में जाकर "Generate Payroll" पर क्लिक करें। सिस्टम पूरे महीने का डाटा देखकर इस फॉर्मूले से सैलरी बनाएगा:

> **[+] फिक्स कमाई:** (Basic Pay + फिक्स Allowances)
> **[-] छुट्टियों के पैसे कटे:** (1 दिन की सैलरी × कुल Absents) + (1 दिन की सैलरी × 0.5 × कुल Half Days)
> **[-] फिक्स कटौतियां:** (जैसे कोई फिक्स फण्ड या पेनल्टी)
> **[-] एडवांस लिया गया:** (महीने के बीच में लिए गए पैसे)
> **[+] कुल कमीशन:** (पूरे महीने सेल करके कमाया गया पैसा)
> 
> **= फाइनल सैलरी (NET PAYABLE)**

सैलरी जनरेट होने के बाद, आप कर्मचारी को उसकी पूरी **सैलरी स्लिप (Salary Slip)** प्रिंट करके दे सकते हैं!
      `
    }
  },
  {
    id: "inventory",
    title: {
      en: "Inventory & Purchases",
      hi: "स्टॉक और खरीदारी (Inventory)",
    },
    icon: "Store",
    content: {
      en: `
### Inventory Management

Keep track of what items are in your shop and who you bought them from.

**1. Adding Stock:**
* Go to Items/Inventory to add your products. 
* Set a **Reorder Alert Level**. For example, if you set it to 5, the Dashboard will alert you when you have less than 5 pieces left so you can order more in time.

**2. Suppliers & Purchases:**
* When the distributor sends new stock, go to **Suppliers** and add a New Purchase.
* You can record how much you paid the supplier and how much is pending (Khata).
* The stock of the items purchased will automatically increase in your shop's inventory!
      `,
      hi: `
### दुकान का स्टॉक (Inventory)

अपनी दुकान के सारे सामान और डिस्ट्रीब्यूटर के खाते का हिसाब यहाँ रखें।

**1. स्टॉक चढ़ाना:**
* Inventory में जाकर अपना नया सामान जोड़ें।
* **Reorder Alert** सेट करें। मान लीजिए आपने इसे 5 पर सेट किया, तो जैसे ही वो सामान दुकान में 5 से कम होगा, डैशबोर्ड आपको बता देगा कि "सामान ख़त्म हो रहा है, नया मंगवा लो!"

**2. सप्लायर और खरीद (Purchases):**
* जब डिस्ट्रीब्यूटर (Supplier) से नया माल आए, तो Suppliers में जाकर "New Purchase" (नयी खरीद) चढ़ाएं।
* आप लिख सकते हैं कि डिस्ट्रीब्यूटर को कितना पैसा दे दिया है और कितना बाकी (खाता) है।
* जो माल आप यहाँ चढ़ाएंगे, वो अपने आप आपकी दुकान के स्टॉक (Inventory) में जुड़ जाएगा!
      `
    }
  }
];
