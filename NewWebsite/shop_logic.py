import random

# ---- Idea for calculation of Propability ----
# have each kind of 'shopobject' roll for a random number
# the lower the chance of rolling the lower the highest number able to roll is
# 1. Each object type rolls for the general propability and the highest num wins.
# 2. Do the same for the tier of the type -> example: 5 rarities -> highest amount of health buyable is 5 lowest is 1, amount depends on tier; Weapons are categorised in different tiers, just average rarity system from that point on
# 3. Just choose a random number in range of the list of acceptable items

# Different shop slots can have different propabilities of certain objects or object types
# Left: More Stat upgrades -> More affordable; Middle: More Items/Trinkets -> normal Pricing; Right: More Wepons -> higher Pricing; 
# <----->
# Pricing applies to the shop slot in general and is not determined by the item directly -> Lucky to get Weapon in the left slot -> it's cheaper if you do
# Not all shop slots are always open (unless certain item) 
# -> Left is always open (or a 5% chance to close) 
# --> Middle is open/closed in rythym (or 30% chance to close) 
# ---> Right is open every 3 rounds (or has a 50% chance to close) (Idk what system is better)

stat_list = ['health','speed','damage']
weapon_list = ['basic','sniper']
item_list = ['item_1','item_2','item_3','item_4','item_5','item_6']

def get_content(type):
    if type == 'wep':
        output = random.randint(0,len(weapon_list)-1)
        return weapon_list[output]
    elif type == 'stat':
        output = random.randint(0,len(stat_list)-1)
        return stat_list[output]
    elif type == 'item':
        output = random.randint(0,len(item_list)-1)
        return item_list[output]
    return None
        


def get_tier(tier_num):
    if tier_num<=30:
        tier = '1'
    if tier_num>30:
        tier = '2'
    if tier_num>60:
        tier = '3'
    if tier_num>80:
        tier = '4'
    if tier_num>90:
        tier = '5'
    return tier
def slot_1():
    out = roll_type_tier()
    if out[0]<=10:
        type = "wep"
    elif out[0]<=30 and out[0]>10:
        type = "item"
    elif out[0]<=100 and out[0]>30:
        type = "stat"
    tier = get_tier(out[1])
    content = get_content(type)
    return [type,tier,content]

def slot_2():
    out = roll_type_tier()
    
    if out[0]<=20:
        type = "stat"
    elif out[0]<=50 and out[0]>20:
        type = "wep"
    elif out[0]<=100 and out[0]>50:
        type = "item"
    tier = get_tier(out[1])
    content = get_content(type)
    return [type,tier,content]
def slot_3():
    out = roll_type_tier()
    if out[0]<=20:
        type = "stat"
    elif out[0]<=50 and out[0]>20:
        type = "item"
    elif out[0]<=100 and out[0]>50:
        type = "wep"
    tier = get_tier(out[1])
    content = get_content(type)
    return [type,tier,content]

def roll_type_tier():
    type = random.randint(0,100)
    tier = random.randint(0,100)
    return [type, tier]

def get_shop():
    s1 = slot_1()
    s2 = slot_2()
    s3 = slot_3()
    return {'type_1':s1[0],'tier_1':s1[1],'content_1':s1[2],'type_2':s2[0],'tier_2':s2[1],'content_2':s2[2],'type_3':s3[0],'tier_3':s3[1],'content_3':s3[2]}