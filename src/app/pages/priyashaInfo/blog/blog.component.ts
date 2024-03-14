import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { DatePipe } from '@angular/common';
import { IF_LOGIN_ALLOW } from '@constant/constants';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit, AfterViewInit {
  like: boolean = false;
  prod: boolean = IF_LOGIN_ALLOW;
  commingSoonPopUp: boolean = false;
  termNCndPopUp: boolean = false;
  activeTab: string = 'Personal Details';
  ShowBlog: number = 0;
  atcivetype: boolean = true;
  currentDate: any = new Date();
  openBlogIndex: number = 0;
  Dot_blogs: string;
  NewBlogView = [
    {
      HeadLine: 'Everything you need to know about Lasik ',
      Blog: `Lasik, or the Laser-Assisted In Situ Keratomileusis, is a beneficial surgery that changes the shape of the cornea and makes a person less dependent on contact lenses or glasses. The whole process is an outpatient procedure where people can go home on the same day. The Lasik process is pain-free and a permanent solution for better vision.
      <br> <br> During this process, with the help of a programmed laser, the surgeon changes the shape of the cornea. Here, each pulse removes a small number of corneal tissues. As a part of reshaping procedure of the eye, eye surgeon performs corneal flap back to create a protective layer for the surgical site.`,
      HeadLine2: `Why do people mostly go for LASIK?`,
      Blog2: `People mostly choose Lasik due to various reasons. Or, the reason behind LASIK varies from person to person. Here are some of the most common reasons for having LASIK surgery.<br><br>
      •	Making vision clear<br>
      •	Freedom from contact lenses and glasses<br>
      •	Best for sports and exercise<br>
      •	Get rid of contact lens complications.<br>
      •	Easy for swimming.
      <br><br>
      For example, Jill Kintner, had done LASIK treatment before heading the 2008 Olympics and got a bronze medal. `,
      images: 'big-brother',
      Dot_blogs: `<h6>What conditions does LASIK treat?</h6>Lasik is being used for treating vision problems like-
      • <b>Nearsightedness (myopia) -</b> This is a situation where the eyeball of the person is slightly longer, and as a result, the curve of the cornea becomes too sharp. As a result, the 
         vision becomes blurry for the objects in the distance. Objects that are in close position can be seen clearly.
      • <b>Farsightedness (hyperopia) - </b>In the case of Farsightedness, people have short eyeballs and flat corneas. And the texture of the cornea makes near vision blurry. In some cases, 
         this position can also make the distant vision blurry.
      • <b>Astigmatism -</b> In the case of Astigmatism, the cornea remains flat, and it makes near and distant vision blurry.
      <h6>How to prepare for Lasik?</h6>Like any other surgical process, for LASIK, people also have to follow pre-operative procedures. Doctors will give detailed pre-operative instructions to the person about LASIK. Here are some general tips that should be followed on the day of LASIK.
      • <b>Avoid cosmetics:</b> On the day of LASIK, you need to avoid any cosmetics such as Deodorants, lotions, aftershave, or any makeup products.
      • <b>Don’t drive post-surgery :</b> After having LASIK, you cannot drive immediately, so make sure you are bringing your driver with you to reach home safely.
      • <b>Go for comfortable dresses:</b> Wear a dress that won't force you to change clothes once you reach home post-surgery.. Also, don't wear any hair accessories to make you feel 
         comfortable during and after the surgery.
      • <b>Keep your eye drops with you:</b> Keep your antibiotic and anti-inflammatory eye drops with you on LASIK surgery day.
      • <b>Avoid caffeine:</b> Having caffeine cannot help you sleep after surgery, so avoid taking caffeine. Instead, go for more water intake so that you can keep your eyes moist after the 
         surgery.
      <h6>Lasik- Is it safe for the general population?</h6>Before having the LASIK, there are few points that should be kept in mind to avoid risks. Doctors also mainly focus on these points before the surgery.
      • <b>Are your eyes healthy?</b>
         Only healthy eyes without Inflammation, eye injuries, dry eyes, large pupils, glaucoma, and cataracts are considered safe for the surgery. So, before you have LASIK, make sure 
         you are not suffering from these problems. Your eye surgeon will also analyze these problems first before declaring you fit for the surgery.
      • <b>Are you healthy?</b>
         Not just your eye conditions; if you are not healthy, then you cannot go for LASIK. If and only if you are healthy, immune-damaging conditions like autoimmune disorders, 
         immunosuppressive medications, and uncontrolled diabetes can impair healing and increase infection risk. In contrast, uncontrolled diabetes can lead to complications. In such 
         conditions, you cannot take LASIK.
      • <b>Affordability:</b>
         Most insurance companies do not cover the cost of LASIK, so make sure you can afford the cost of the surgery before you decide to opt for LASIK. 
      <h6>Possible side effects of Lasik</h6> Before you go for this treatment, you should know the treatment is almost safe, but it can have minor side effects such as dry eyes, glare, halos, double vision, under-correction or 
 over-correction issues, and flap issues. In rare cases, you can also encounter infection, vision loss, or a vision threat. It's up to you to make the decision responsibly.
 <br> When it comes to making your vision better, nothing can beat LASIK. By analysing the threats and benefits mentioned here, make the best choice for your eye.`,
      endHeadLine: ``,
      endBlog: ``,
      PS: `Source:-`,
      Source: ``
    },
    {
      HeadLine: 'Glaucoma- Another name for Blindness',
      Blog: `Glaucoma is a type of eye disorder that destroys optic nerves. The reason behind Glaucoma is the fluid that builds up in the front part of the eye. When the amount of fluid becomes excessive, the extra fluid puts extra pressure on your vision and damages it. The pressure is also known as intraocular pressure (IOP) or general eye pressure. But, not every time is eye pressure responsible for Glaucoma. It does not matter for which reason you are encountering it, but when you meet, always make sure you seek support from your doctor. Remember, untreated Glaucoma can cause permanent vision loss or blindness.`,
      HeadLine2: `How common is Glaucoma?`,
      Blog2: `Glaucoma is denoted as a prevalent eye issue that causes blindness after cataracts. So, it can be said that globally, it is meant to be the second leading cause of blindness. According to the Indian Journal of ophthalmology. The prevalence of Glaucoma among Indians is estimated to be between 2.7% and 4.3% based on epidemiological studies on the condition involving persons 40 years of age and older. By 2040, 27.8 million more people in Asia are expected to suffer from Glaucoma; China and India will bear the most significant part of this burden.`,
      HeadLine3: `What are the types of Glaucoma and what are the symptoms of it?`,
      Blog3: `The closed-angle Glaucoma is the most common type of Glaucoma in Asia. There are various types of glaucoma present, including:`,
      images: 'ophthalmologist',
      Dot_blogs: `•  <b>Open-angle Glaucoma:</b>  This is also known as wide-angle Glaucoma, where the eye drain structure or trabecular meshwork remains fine, but the fluid does not flow out naturally. At the early stage, it doesn’t give any symptoms, but later, it can be the reason behind your Patchy blind vision or it will be difficult for you to see from the central eye. 
      
•  <b>Closed-angle Glaucoma:</b> When the pupil of the eye becomes too big too quickly, it blocks the drainage canal of the eye and prevents fluid from leaving the eye. As a result, it increases the eye pressure and causes Glaucoma. Symptoms of it include Severe headache, Blurred vision, Severe eye pain, Eye redness, Nausea or vomiting, and Halos or colored rings around lights. 

•  <b>Normal-tension Glaucoma:</b> As the name suggests, the Glaucoma appears even when the eye pressure remains normal. It also does not give any symptoms at an early stage, Then, blurred vision and in later stages, loss of side vision.       
      
•  <b>Congenital Glaucoma:</b> It appears among children. Common symptoms of this glaucoma are Blurred vision, Cloudy eye, Headache, Increased blinking, and Tears without crying. 

<h6> Who is at risk? </h6>Anyone can encounter Glaucoma, but some people are more likely to develop this issue; here is a list of some of them:
•	People whose age is more than 40.
•	Whose family members have Glaucoma
•	People with high eye pressure. 
•	Thinner optic nerve.
•	People using long-term steroid medications
•	People have diabetes, migraines, high blood pressure, poor blood circulation

<h6>Can Glaucoma Be Stopped?</h6>There is no cure for the problem. Once you encounter it, you have to deal with it. But you can treat the situation earlier to protect your eyes from vision loss and prevent symptoms from worsening.

<h6>Stay on top of glaucoma</h6>•	Exercise regularly
•	Eat a healthy diet
•	Take glaucoma medications regularly
•	Be careful while wearing a contact lens. As contact lenses prevent eye drops from penetrating the eye completely, it could make the glaucoma treatment inactive.`,
      endHeadLine: `Helpful facts`,
      endBlog: `In many cases, people develop Glaucoma in both of the eyes. In this case, the severity of the disease does not remain the same in both eyes. When both eyes are affected, one eye will have moderate to severe damage, whereas the other will be mildly damaged. People who have closed-angle Glaucoma in the eye are likely to develop Glaucoma in the second eye within five to ten years.`,
      PS: `Source:-`,
      Source: ``
    },
    {
      HeadLine: 'How can the HPV vaccine help with cervical cancer?',
      Blog: `Cervical cancer is a type of cancer that starts from the cells of the Cervix- the narrow end of the uterus. Cervical cancer gradually develops over time. Before cancer, the cervix cells develop dysplasia, and abnormal tissues start developing in the cervical tissue. If it is not removed or destroyed over time, it can develop cancer.
      Human papillomavirus, also called HPV, mainly causes cervical cancers. HPV is a common infection that passes through sexual contact. The body's immune system generally prevents this virus from harming the body. In a small number of people, the virus survives for years and causes some cervical cells to become cancer cells.
      Surgery to remove the cancer is frequently used as the initial treatment for cervical cancer. Medication to destroy the cancer cells may be one of the other treatments. Chemotherapy and medications for targeted therapy are possible options. Muscular energy beam radiation therapy is another option. Radiation therapy is occasionally used with low-dose chemotherapy.
      By performing screening tests as well as taking HPV vaccines, people can stay safe from cervical cancer.
      `,
      HeadLine2: `HPV vaccine- A vaccine to prevent cervical cancer?`,
      Blog2: `Most occurrences of cervical cancer and genital warts are prevented with the HPV vaccine. It guards against HPV-related cancer of the vagina, vulva, penis, or anus. Not just that, the HPV vaccine guards against HPV-related malignancies of the mouth, throat, head, and neck. The vaccine provides the body with complete safety while introducing certain HPV strains into the immune system. This implies that if a person contracts such strains of the virus later, their body will have an easier difficulty getting rid of them.`,
      HeadLine3: `Effectiveness of HPV vaccine`,
      Blog3: `HPV is a very effective vaccine against various HPV types that causes cervical cancer as well as some other cancers of the vulva, vagina, anus, and oropharynx. It is highly effective for those people who are not exposed to one or more HPV types. But for those ladies who are already exposed to the HPV virus, it could be less effective. This is so that HPV cannot infect a person before they are exposed to it. Currently, active HPV infections or illnesses linked to HPV are not treated by the HPV vaccine.`,
      images: 'diana-polekhina',
      Dot_blogs: `<h6>Who should not get the HPV vaccine?</h6>HPV is not for all, especially those people who are allergic to it. After taking the first shot of the HPV vaccine, if someone notices she is allergic to it, she cannot take the next shot of the HPV vaccine. Other than that, the HPV vaccine cannot be given during pregnancy. Besides that, people who are moderately ill or sick cannot take the shot until they feel better.

<h6>What does the vaccine not protect against?</h6>The vaccine will not work for every HPV type, so it cannot prevent all cases of cervical cancer. For this reason, women who are taking these vaccines should complete the screening process for cervical cancer to know if they are still safe or not. Besides that, additional sexually transmitted infections (STIs) are not prevented by the vaccine.

<h6>Safety check: HPV vaccine</h6>According to most of the studies, the HPV vaccine tends to be safe. Mostly, the side effects of it remain mild. Among them, most ladies face soreness, swelling, or redness at the injection site. Sometimes, ladies can be fainted after taking the shot. After the shot, remaining seated for fifteen minutes can reduce the chance of fainting. There may also be headaches, nausea, vomiting, exhaustion, or weakness. The FDA and the CDC are still keeping an eye out for any strange or severe issues with this vaccine.

<h6>Conclusion</h6>In India, the HPV vaccine is available in almost all government and non-government clinics but it’s not free for now, and it is also marked safe to take. Under the government's scheme, girls in India between the ages of 9 and 14 would receive free vaccinations in three phases over the following three years. The HPV vaccination will be a part of the government's regular immunization program for 9-year-old girls after the "catch-up" is finished.
      `,
      endHeadLine: ``,
      endBlog: ``,
      PS: `Source:-`,
      Source: ``
    },
    {
      HeadLine: 'Smoking and eye health: Everything you need to know',
      Blog: `Everyone knows smoking is harmful to health. It causes cancer, it causes pulmonary diseases, and so on. But, many people, till now, are unaware that smoking can also cause eye problems. Shocked? Well, you are not alone; Merlin, a chain smoker, started losing her vision only at the age of 56; she had to take several injections in each eye to prevent further vision loss. According to doctors, excessive smoking is the main reason behind her vision loss. Not just Merlin, you can also face the same issue if you go for excessive smoking. How? Follow the blog and learn more.`,
      HeadLine2: `The connection between smoking and eye health`,
      Blog2: `Cigarettes release toxins in the body that travel to your bloodstream and harm important parts of the eyes that are necessary to give you clear vision and healthy eyesight. It can harm your retina, lens, and Macula over time. Not just that, it may worsen a number of common eye diseases, including uveitis, dry eyes, and optic nerve damage. Cigarette smoke can harm the optic nerve and produce inflammation, itching, redness, and watery eyes. As a result, your vision can be cloudy, or you can lose your eyesight completely. Not just that, most patients can also develop problems recognizing faces.
      
      Smoking increases the risk of developing AMD (age-related macular degeneration) and cataracts; for smokers to create these conditions compared to non-smokers is 50%.`,
      HeadLine3: `How can you prevent vision loss due to smoking?`,
      Blog3: `Stop smoking to get rid of the higher chances of vision loss. Still, if you are already encountering AMD, you should exercise regularly, maintain a healthy diet, maintain blood pressure and cholesterol levels, and wear sunglasses to protect your eyes from sunlight to prevent the worst situation.

      Once you encounter symptoms in your eyes, immediately contact an optometrist and treat your eyes. In particular, quit smoking if you want to keep your eyes healthy.
      `,
      images: 'donn-gabriel', 
      PS: `Source:-`,
      Source: ``
    },
  ]
  blogView = [
    {
      HeadLine: 'Chemo-Immunotherapy: A New Trend in Cancer Treatment',
      Blog: `Chemo immunotherapy has now become a saviour treatment method for many cancer patients. As name suggests, it is a combined therapy where chemotherapy, directly kills cancer cells and prevents cancer cell division and on the other hand, Immunotherapy helps immune system to response to cancer.`,
      HeadLine2: `Determinants of the success of immunotherapy`,
      Blog2: `The success of chemo immunotherapy, depends upon several determinants such as:`,
      images: 'Chemo-Immunotherapy',
      Dot_blogs: `       ● The correct dose of immunotherapy.
       ● Proper timing of Chemo-Immunotherapy.
       ● The sequence of therapy.`,
      endBlog: `The chemo immunotherapy is still in the clinical trial process in the USA and, still now, it has given a good result in cancer treatments. Combinations of chemotherapy and immunotherapy have shown effective in treating several cancers; nevertheless, their progress is being hampered by our incomplete knowledge of immunomodulatory qualities and the best combinations of dosage, timing, and sequence. More number of clinical trials will help researchers to understand benefits of the treatment. `,
      PS: `Source:-`,
      Source: `
      www.pennmedicine.org, 
      www.researchgate.net, 
      www.ncbi.nlm.nih.gov, 
      www.news-medical.net, 
      www.freepik.com, 
      `
    },
    {
      HeadLine: 'Why does celiac disease risk in young kids are rising?',
      Blog: `Celiac diseases among children are rising day by day; the main reason behind the problem is taking too much gluten before the age of 5. Now the question is what is celiac? Celiac is a chronic digestive and immune disorder, that are responsible for the damage of small intestine.`,
      Blog2: `Recently, a study was performed by Swedish researchers where they observed 6,605 children from their birth age to age 5. Every few months throughout these early years, they recorded how much gluten each child consumed over three days. When the observation period ended, researchers found those children who had taken more gluten were likely to develop autoimmunity as well as celiac disease. Overall, they noticed every gram of gluten intake increases the risk of developing celiac disease.`,
      images: 'Why does celiac',
      endBlog: `So, when it is time for a child to go for solid foods, every guardian should have to talk to their paediatrician to choose the correct diet plan for their kids. Especially when the child has a family history of celiac or type 1 diabetes, above precautionary steps need to be followed.`,
      PS: `Source:-`,
      Source: `
      www.news-medical.net, 
      www.niddk.nih.gov, 
      kidshealth.org, 
      www.freepik.com, 
      `
    },
    {
      HeadLine: 'Everything you need to know about the DASH diet',
      Blog: `
      The Dietary Approaches to Stop Hypertension, or DASH, is a popular diet form nowadays that is ideal for people who have hypertension. Not just reducing hypertension, it also helps in the reduction of cholesterol that is linked to heart disease, which is also called low-density lipoprotein (LDL) cholesterol or bad cholesterol.`,

      HeadLine2: `What to eat when you are on a DASH diet?`,
      Blog2: `
      Foods that can be taken during the DASH diet should be rich in the minerals, potassium, calcium, and magnesium. The DASH diet is based on the benefits of vegetables, fruits, and whole grains, and it also contains fat-free dairy products, fish, poultry, beans, and nuts.
      Not just that, the diet helps to limit the intake of foods that are rich in sodium or salt, added sugar, saturated fat, and full-fat dairy products.

      It may take time for your taste buds to adjust; you must wait till then; once your taste bud adjusts to your food habit, dash diet can save your life. 

      `,
      images: 'Everything you need_2',
      Dot_blogs:
        ` `,
      endBlog: ``,
      PS: `Source:-`,
      Source: `
      www.heart.org, 
      www.mayoclinic.org, 
      www.freepik.com, 
      `
    },
    {
      HeadLine: 'Everything you need to know about low FODMAP Diet',
      Blog: `The name FODMAP diet is a form of a diet that has short-chain carbohydrates that are poorly absorbed in the small intestine and ferment in the colon.
      When it is the time to give your digestive system a rest, it would be the best for you to go for the low- FODMAP diet. The full acronym of the FODMAP is Fermentable Oligosaccharides, Disaccharides, Monosaccharides and Polyols. When a person is in a low FODMAP diet, they temporarily restrict intaking these carbohydrates to get rid of uncomfortable symptoms from the body and to give their stomach a rest. 
      This is a process to remove irritants from the gut and give gut linings a chance to repair and it helps in the restoration of the healthy balance of the gut flora.`,
      HeadLine2: 'What did you can eat during low FODMAP diet?',
      Blog2: `When you are in a low FODMAP diet, it means, you must reduce FODMAP intake, here is a complete list of foods that you can eat during low FODMAP diet.`,
      images: 'Everything you need',
      Dot_blogs: `      ● Meat and eggs
      ● Some cheeses, including feta, cheddar, brie, and Camembert
      ● Almond-based milk
      ● Grains such as oats, rice, and quinoa
      ● Veggies such as tomatoes, cucumbers, potatoes, eggplant, and zucchini
      ● Fruits including pineapple, oranges, grapes, strawberries, and blueberries.`,
      endBlog: `Once you notice, your gut related symptoms are improving, you can limit intake of same food in future.`,
      PS: `Source:-`,
      Source: `
      www.healthline.com, 
      my.clevelandclinic.org, 
      www.hopkinsmedicine.org, 
      www.freepik.com, 
      `
    },
    {
      HeadLine: 'What are the symptoms of Sulfa allergy?',
      Blog: `Sulfa allergy is a type of allergy where people are allergic to certain kinds of medications. If you have a sulfa allergy, you cannot take medications that contain sulfa for example: Co-Trimoxazole (Treats phenumonia), Sulfadiazine Sulfamethoxazole (for urinary tract infection), Trimethoprim-Sulfamethoxazole (For traveler's diarrhea). Otherwise, you will develop an allergic reaction. Here is the list of rare but dangerous symptoms that a person can encounter after taking sulfa medicines.`,
      images: 'What are the symptoms',
      Dot_blogs: `      ● Difficulty swallowing.
      ● Breathing trouble.
      ● Muscle and joint aches.
      ● Sore throat.
      ● Fever and flu-like symptoms.
      ● Skin blisters and peeling skin.

       Also, some common symptoms of sulfa drug allergy are as follows:
      ● Itchy skin. ● Skin rash. ● Hives. ● Sensitivity to sunlight. ● Headache.
      ● Swelling in hands, feet, mouth, and tongue. ● Nausea, vomiting or diarrhoea.`,
      endBlog: `However, once you face any symptoms like this after taking a medicine, you immediately must consult your physician and take some anti-allergic drugs to cure.`,
      PS: `Source:-`,
      Source: `
      www.mayoclinic.org, 
      www.healthline.com, 
      my.clevelandclinic.org, 
      www.freepik.com, 
      `
    },
    {
      HeadLine: 'Top Prevention: Everyday ways to keep your aging brain healthy',
      Blog: `A study found that brain aging starts only at the age of 25. To prevent the problem, the only
            thing you must follow is to maintain some valuable tips and facts that can work beyond the
            actual medicine. It could be performing exercise for brain health or taking brain health
            supplements; you should take any step to prevent the situation. Not just that, you can also
            follow these tips that can help you out.`,
      images: 'offtopic_12',
      Dot_blogs:
        `      ● Take help from mental stimulation
      ● Improve your diet
      ● Get plenty of sleep 
      ● Minimize stress level
      ● Quit smoking `,
      endBlog: 'Brain aging can reduce your independence level and remove you from your community and the workforce. So, it is essential to take some prevention before it starts. Follow the guide and stay healthy.',
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Potential risks of using headphones',
      Blog: `Nowadays, people use headphones to stay away from the entire world for some time. Like
      us, many people love to use headphones regularly to listen to their favourite music. But,
      using headphones is not safe all the time. It can carry forward various health issues as
      follows. From lacking focus to ear infection, it may cause multiple problems that may lead to
      danger for your health.`,
      images: 'offtopic_21',
      Dot_blogs:
        `      ● Ear infection
      ● Ear Pain
      ● Tinnitus 
      ● Long Term dizziness
      ● Tinnitus 
      ● Hearing Loss`,
      endBlog: `So, whenever you are willing to stay safe from these problems, you need to reduce the
      usage of headphones and keep your ear healthy.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Impact of mobile phones on children',
      Blog: `Day by day, children are getting attracted to mobile phones. From the beginning of the day
      to the end of it, children are using mobile phones and it is creating a bad impact on them. On
      that note, it is very important to get them away from mobile phones, as they can develop
      these further problems that are listed here.`,
      images: 'offtopic_20',
      Dot_blogs:
        `      ● Low IQ and Improper mental growth
      ● Sleep deprivation
      ● Psychiatric deceases 
      ● Educational burdens
      ● Eye problems 
      ● Inappropriate Behaviour
      ● Cancer `,
      endBlog: `Most parent thinks using a mobile phone makes a child smarter and helps them to deal with
      modern gadgets from a very early stage, but it is not correct. When they notice their child
      with a mobile phone, they have to stop them right away to get rid of the dangerous situation
      that is coming towards them.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Can low sugar levels be dangerous for diabetic people?',
      Blog: `For diabetic people, it is essential to maintain the sugar level in the body. Otherwise, they fail to
      pursue their regular work. The condition when the sugar level drops in the body are known as
      Diabetic hypoglycemia. Early and the warning signs of Diabetic hypoglycemia`,
      images: 'offtopic_24',
      Dot_blogs:
        `      ● The skin will become pale in the diabetic patient
      ● Shakiness
      ● Headache
      ● Feeling weak or having no energy
      ● Hunger or nausea
      ● Difficulty in concentrating on anything
      ● numbness of the lips 
      ● Fatigue `,
      endBlog: `So, it is essential to take care of the person facing severe problems related to a diabetic person.
      They need help from a medical practitioner, which will also be helpful for them in many cases.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    // {
    //   HeadLine: 'What Is Existential Depression and How to Cope?',
    //   Blog: `Depression can kill a person from the inside, and this is a hazardous psychological condition that
    //   can appear at any time of your life and destroys your mental peace. It can be divided into several
    //   types, and above all, Existential Depression is another dangerous specifications of it. When it appears, a person can be demotivated from the inside and becomes unsatisfied in their
    //   life. As a result, the case becomes fatal for many. It is essential to detect and overcome
    //   depression quickly. Here are some quick tips that a person can follow to cope with Existential Depression.`,
    //   images: 'offtopic_22',
    //   Dot_blogs:
    //     `      ● Connect with more people
    //   ● Go for mindfulness
    //   ● Do necessary changes in your viewpoint
    //   ● Go for professional treatment `,
    //   endBlog: `Suicide is not a way to get relief from depression; if you think you have depression, contact a
    //   medical practitioner immediately and get help from them.`
    // },
    {
      HeadLine: 'Include THESE fruits in your everyday diet to eliminate the chances of heart diseases',
      Blog: `Do you know eating fruits regularly can be magic for you to stay away from a heart problem? On
      that note, it is very important to take help from the proper diet to help you stay healthy for your
      heart. There are several fruits there that you should keep in your everyday diet so that you will be
      able to prevent heart diseases effectively. Intaking them on a regular basis is also a good habit, so
      you can include them in your everyday routine too.`,
      images: 'offtopic_10',
      Dot_blogs:
        `      ● Apple
      ● Berries
      ● Oranges
      ● Watermelon`,
      endBlog: `When it comes to keeping your heart healthy, it is essential to take help from healthy diet
      options. It will be very much effective against heart deceases. Also, the tips and facts that are
      mentioned here are completely for general information’s only, always you have to consult your
      doctor as well as dietitians if you are in a special diet to include these fruits in your diet.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'The Early Signs of Dementia',
      Blog: `According to the World health organization, more than 55 million people worldwide are
      currently living with dementia, and every day almost 10 million new cases of dementia can arise.
      The problem is that most people fail to identify common memory loss issues with dementia,
      which makes the situation more confusing. Here are some early signs that can guide you to know
      the early signs of dementia.`,
      images: 'offtopic_3',
      Dot_blogs:
        `      ● Slight changes in short-term memory
      ● Finding the right words becomes difficult.
      ● Mood Swings
      ● Task completion difficulty
      ● Confusion
      ● Poor decision-making
      ● Difficulty in concentrating `,
      endBlog: `If these symptoms occur with you or near one, you can consult a medical practitioner first and
      take the necessary medications.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Interesting Facts About Music Therapy',
      Blog: `Almost every person around us is aware of the importance of music therapy in daily life. This
      therapy originated during World War 1 and 2 as the best healing method for soldiers. Since
      that time, it has become one of the most effective choices for medical professionals to
      provide mental and physical support to patients. It can heal them by eliminating side effects.
      Below are the benefits of using music therapy.`,
      images: 'offtopic_9',
      Dot_blogs:
        `      ● It can work as the best medicine for the drugs and alcohol addicts
      ● Music therapy can provide comfort to cancer patients.
      ● Music therapy has a positive effect on autistic patients.
      ● The treatment can even assist in labour and deliveries. `,
      endBlog: `The importance of music therapy is rapidly increasing in today&#39;s world for the accuracy of
      treatment and for fewer side effects. People who are not fine mentally and physically, music
      therapy is now being used as a working method of treatment that starts making people
      happier from inside thus, they feel good physically too. Not just patients, music therapy can
      treat students also to enhance attention and concentration level to have a good score.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Sleep deprived? Cardiologists on how it can raise the risk of heart attack',
      Blog: `Do you like to watch movies or web series at night? Doing so is insisting you deprive
      yourself of sleep at night. It can be dangerous for your health. Sleep deprivation can lead to
      a heart attack also. This is not a myth; according to the American health association, this is a
      proven truth. Not just that, they have also added sound sleep can also improve your heart
      health.`,
      images: 'offtopic_4',
      Dot_blogs: ``,
      endBlog: `If you think sleeping can improve your heart health, you are also going wrong. The study
      also says that oversleeping can also lead to heart disease. For this reason, you should take
      care of your sleeping durations so that you will be able to stay healthy.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Foods to Reduce Your Risk of Dementia',
      Blog: `Dementia is one of the most common chronic disorders that can also be fatal. Due to this
      disorder, the brain starts shrinking, and it ultimately causes brain cells to die. Dementia
      decreases the thinking ability of a person. As a result of it, patients face memory loss issues
      as well as various other restrictions in the functioning of their bodies. Intake of multiple foods
      as follows can reduce the chances of facing dementia.`,
      images: 'demensia',
      Dot_blogs:
        `      ● Green leafy vegetables
      ● Nuts
      ● Fatty fish
      ● Poultry 
      ● Caffeinated drinks 
      ● Dark chocolate 
      ● Cinnamon  `,
      endBlog: `Not just for those people who want to avoid dementia, people with dementia can also take
      them to get a good result. People who are facing dementia, they can try these things for a
      good result, but obviously, they should have to take help from their dietitians to follow the
      proper diet chart before consuming the elements that are listed here.`,
      commentCount: 10,
      views: 90,
      like: false
    },
    {
      HeadLine: 'Home Remedies For Gall Bladder Stone',
      Blog: `Gallbladder stones can be hazardous for your regular life. On that note, after diagnosing gallstones, people should have to take immediate medications with help. If so, they can get out of the problem effectively. People can also get rid of gallbladder stones by using effective home remedies. Those are listed here. If you are facing gallstone, you can go for it and get the benefits.`,
      images: 'HomeRemedies',
      Dot_blogs:
        `  ● Taking help from turmeric combined with honey will regularise bowel
       movement and keep the gall bladder free from stones.
  ● You can also intake milk thistle; it will help you shrink gallstones and 
      help you get relief from the pain of the gall bladder. 
  ● You can also take lemon water on an empty stomach, and it also 
      provides relief against gall bladder pain and gallstone. 
  ● Increasing vitamin C intake will also become beneficial against gall stones and 
      pain. 
  ● You can also intake beetroot juice to reduce pain and swelling related to 
      gall bladder pain. Not just that, it will also reduce the risk of high cholesterol.
           `,
      endBlog: `These tips will work as one of the best home remedies to remove gallbladder stones. You can take help from the angles and get the solution.`,
    },
    {
      HeadLine: 'Powerful health benefits of dark chocolate',
      Blog: `Most people think chocolates harm their bodies, but do you know what? Eating dark chocolate can be a healthier option for you. Well, in this situation, it can generate several benefits for your health, and it would also benefit you. Now, if you are unaware of the health benefits of dark chocolate, you can get help from this article; it will help you know about its benefits. `,
      images: 'Powerfulhealth',
      Dot_blogs:
        `  ● Dark chocolates are a source of powerful antioxidants. 
  ● It can improve blood flow levels. 
  ● It reduces the chance of heart attack. 
  ● It will help you to protect your skin from sun exposure. 
  ● Dark chocolate works best to improve brain function. 
           `,
      endBlog: `If you are staying away from chocolates, you can take dark chocolate and get the health benefits enlisted here to stay healthy. You can even take dark chocolates regularly and see the benefits in your everyday life. `,
    },
    {
      HeadLine: 'Natural home remedies for anxiety',
      Blog: `Now, people are becoming faster in their lifestyle. As a result, they become more anxious, destroying their regular lifestyle. In this scenario, most people use cognitive behavioral therapy, also known as CBT, to eliminate the problem. But, do you know? Notjust CBT, you can also get relief from anxiety with the help of some natural home remedies. For your convenience, they are listed below. `,
      images: 'Naturalhome',
      Dot_blogs:
        `  ● Always stay active 
  ● Stay away from alcohol  
  ● Try to quit cigarette and alcohol
  ● Always limit intake of caffeine products 
  ● Always meditate properly
           `,
      endBlog: `If you are facing the issue, you have to make sure that you are taking help from the tips listed here so that you can get the best life without anxiety, and it would be a life savior for you in many cases. `,
    },
    {
      HeadLine: 'What are the common symptoms of a vitamin deficiency?',
      Blog: `There are a number of reasons why people are facing vitamin deficiency issues—those people are even unaware of this fact. A large scale of problems can occur in the body when people lose natural vitamins; these are the most common symptoms that a person can encounter with vitamin deficiency. They are the most common problems that a person can encounter, besides that, there are also a number of rare symptoms are present that a person can encounter.`,
      images: 'Whatarethe',
      Dot_blogs:
        `  ● Fatigue 
  ● Shortness of breath  
  ● Dizziness
  ● Yellowish skin 
  ● Irregular heartbeats
  ● Weightloss
  ● Muscle weakness
           `,
      endBlog: `If you are also facing a common issue with it, you can go to the doctor who will help you out to get the best medications for the problem. Now, if you are also facing the same issue and want to get some home remedies,s then also you can also go for it and get the best home remedies to fix the current situation you are facing due to vitamin deficiency. Hopefully, you will be able to prevent vitamin deficiency levels, which will change your life.`,
    },
  ]

  Latestupdate = [
    { title: 'Unmasking loneliness: The silent epidemic sweeping India and the world', images: 'UnmaskingImg', link: 'https://www.indiatoday.in/health/story/unmasking-loneliness-the-silent-epidemic-sweeping-india-and-the-world-2494802-2024-01-29', Time: 'Jan 29, 2024' },
    { title: 'India on track to achieve 30% reduction in tobacco use prevalence by 2025', images: 'IndiaImg', link: 'https://timesofindia.indiatimes.com/india/india-on-track-to-achieve-30-reduction-in-tobacco-use-prevalence-by-2025/articleshow/107198802.cms?from=mdr', Time: 'Jan 29, 2024' },
    { title: 'Mumps is spreading across this North Indian state; know about its symptoms and treatment', images: 'MumpsImg', link: 'https://timesofindia.indiatimes.com/life-style/health-fitness/health-news/mumps-is-spreading-across-this-north-indian-state-know-about-its-symptoms-and-treatment/photostory/107217581.cms?from=mdr', Time: 'Jan 29, 2024' },
    { title: 'FE Mental Health Series | Why feeling ‘SAD’ in cold weather is not just ‘winter blues’— Decoding the seasonal depression', images: 'FEImg', link: 'https://www.financialexpress.com/healthcare/news-healthcare/fe-mental-health-series-why-feeling-sad-in-cold-weather-is-not-just-winter-blues-decoding-the-seasonal-depression/3377440/', Time: 'Jan 29, 2024' },

  ]
  routeData: any;


  constructor(
    private commonService: CommonService,
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.routeData = this.router.getCurrentNavigation()!.extras.state;
    if (this.routeData) {
      this.ShowBlog = this.routeData.blogIndex
    }

  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBlogZaki(this.ShowBlog)
    }, 10);

  }

  timeDiff(data: any) {
    const blogDateTime: any = new Date(data).getTime()
    const currentDateTime: any = this.currentDate.getTime()
    const timeDiff = Math.floor((currentDateTime - blogDateTime) / 1000);
    if (timeDiff < 60) {
      return 'Now'
    } else if (timeDiff > 59 && timeDiff < 3600) {
      return `${Math.trunc(timeDiff / 60)} ${Math.trunc(timeDiff / 60) > 1 ? 'minutes' : 'minute'} ago`
    } else if (timeDiff > 3599 && timeDiff < 86400) {
      return `${Math.trunc((timeDiff / 60) / 60)} ${Math.trunc((timeDiff / 60) / 60) > 1 ? 'Hours' : 'Hour'} ago`
    } else if (timeDiff > 86399 && timeDiff < 604799) {
      return `${Math.trunc((timeDiff / 60) / 60 / 24)} ${Math.trunc((timeDiff / 60) / 60 / 24) > 1 ? 'Days' : 'Day'} ago`
    } else if (timeDiff > 604799) {
      return `${this.datePipe.transform(blogDateTime, 'dd MMM yyyy')} `
    } else {
      return `${this.datePipe.transform(blogDateTime, 'dd MMM yyyy')} `
    }
  }

  ngOnInit(): void {
    // this.scrollToBlogZaki();
    // window.scrollTo(0, 0);

  }

  scrollToBlogZaki(BlogIndex: any) {
    const blogZakiElement = document.getElementById(`${BlogIndex}`);
    if (blogZakiElement) {
        const scrollTop = blogZakiElement.offsetTop - 100; // Calculate the target scroll position
        window.scrollTo({ top: scrollTop, behavior: 'smooth' }); // Scroll to the target position
    }
    console.log(BlogIndex);
}

  // @HostListener('document:scrollToBlog', ['$event'])
  // handleScrollToBlogEvent(event: CustomEvent) {
  //   this.scrollToBlogZaki('0');
  // }

  blogViewChange(index: number) {
    this.ShowBlog = index;
    this.atcivetype = true
  }

  scrollToDiv(id: any) {
    if (id === 'Login') {
      this.commingSoonPopUp = true;
    }
  }

  closeCommingSoonPopUp() {
    this.commingSoonPopUp = false;
  }
  openTermNCndPopUp() {
    this.termNCndPopUp = true;
  }
  closeTermNCndPopUp() {
    this.termNCndPopUp = false;
  }

  isChecked(blogIndex: number) {
    return blogIndex === this.openBlogIndex
  }

  openBlog(blogIndex: number) {
    this.openBlogIndex = blogIndex;
  }

  blogLike(blogIndex: number) {
    this.blogView[blogIndex].like = !this.blogView[blogIndex].like
  }

}