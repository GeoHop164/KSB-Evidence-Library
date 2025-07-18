
![App Icon](build/icon_small.png)

# KSB Library

An app to create and manage local libraries of KSB evidence

## Why does it exist?

To provide an interface for storing, accessing, and editing evidence relating to the required Knowledge, Skills, and Behaviours of apprenticeship courses - while tracking which KSBs the evidence is linked to. It then allows this to be exported into a `.zip` of evidence ready to submit as part of the End Point Assessment.

## How does it work?

You first select a folder on your computer - either to create a library, or to load an existing one into the app. When creating a library, you will be prompted to create or load an apprenticeship standard, which includes your KSBs. These will then be saved in the library. As you add evidence, your library gets populated, and you can filter by each K, S, and B to check your progress.

## Security-first approach

Since a lot of KSB evidence could be confidential or otherwise legally protected, this app does not store the images anywhere remotely, and all processing is done locally. When you upload evidence, it simply saves to your library location.

## What if I want it synced?

Since KSB Library doesn't use the cloud, it does mean that only one copy of your data exists by default. However, if you set the location of your library to a cloud location, such as a folder synced with OneDrive or Google Drive, the library will be accessible across devices.

## How do I set up my KSBs?

When you create a new library, you can manually add each KSB, or you can load an existing standard. You can find standards in: `src/main/standards`, and are in the following format:

```json
{
    "standard":"ST0024",
    "year":2018,
    "criteria":{
        "knowledge" : [
            "Mathematics and science for engineers",
            "Materials and manufacture",
            "3D Computer Aided Design and Computer Aided engineering",
            "How to undertake and apply business led projects",
            "Understanding actuators and sensors",
            "Electrical and electronic principles and electronic devices and applications",
            "Product improvement and engineering project management",
            "Digital electronics and microprocessors"
        ],

        "skill": [
            "Comply with statutory and organisational safety requirements and demonstrate a responsible and disciplined approach to risk mitigation, avoidance and management.",
            "Carry out project management on engineering activities",
            "Produce presentations and work to engineering specifications and briefs, presenting and technical problem solving",
            "Schedule and manage engineering activities",
            "Undertake electrical/electronic product manufacturing and testing activities",
            "Demonstrate technical and commercial management in planning and managing tasks & resources"

        ],

        "behaviour": [
            "Safety mindset:  The importance of complying with statutory and organisational health, safety and risk management requirements and the implications if these are not adhered to",
            "Strong work ethic:  Has a positive attitude, motivated by engineering; dependable, ethical, responsible and reliable.",
            "Logical approach:  Able to structure a plan and develop activities following a logical thought process, but also able to quickly “think on feet” when working through them.",
            "Problem solving orientation: Identifies issues quickly, enjoys solving complex problems and applies appropriate solutions. Has a strong desire to push to ensure the true root cause of any problem is found and a solution identified which prevents further recurrence.",
            "Quality focus: Follows rules, procedures and principles in ensuring work completed is fit for purpose and pays attention to detail / error checks throughout activities.",
            "Personal responsibility and resilience: Motivated to succeed accountable and persistent to complete task.",
            "Clear communicator:  Uses a variety of appropriate communication methods to give/receive information accurately, and in a timely and positive manner.",
            "Team player: Not only plays own part but able to work and communicate clearly and effectively within a team and interacts/ helps others when required. In doing so applies these skills in a respectful professional manner.",
            "Applies Lean Manufacturing Principles:   Demonstrates continuous improvement in driving effectiveness and efficiency",
            "Adaptability:  Able to adjust to different conditions, technologies, situations and environments.",
            "Self-Motivation: A 'self-starter', who always wants to give their best, sets themselves challenging targets, can make their own decisions.",
            "Willingness to learn:  Wants to drive their continuous professional development",
            "Commitment: Able to commit to the beliefs, goals and standards of their own employer and to the wider industry and its professional standards."
        ]
    }
}
```

If you prefer to use a text editor, you can write your own standard in this format, save it as a `.KSB-Standard` file, and load it into KSB-Library.
